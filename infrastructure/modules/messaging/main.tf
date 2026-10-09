# ------------------------------------------------------------------------------
# 1. CUSTOM EVENTBRIDGE EVENT BUS
# ------------------------------------------------------------------------------
resource "aws_cloudwatch_event_bus" "platform_bus" {
  name = "dev-enterprise-platform-bus"

  tags = {
    Environment = "dev"
    Project     = "enterprise-platform"
  }
}

# ------------------------------------------------------------------------------
# 2. DEAD-LETTER QUEUE (DLQ) FOR FAILED EVENT PROCESSING
# ------------------------------------------------------------------------------
resource "aws_sqs_queue" "platform_dlq" {
  name                      = "dev-platform-events-dlq"
  message_retention_seconds = 1209600 # 14 days retention for troubleshooting
}

# ------------------------------------------------------------------------------
# 3. SQS QUEUES FOR CONSUMER MICROSERVICES
# ------------------------------------------------------------------------------

# Notification Service Queue
resource "aws_sqs_queue" "notification_queue" {
  name                      = "dev-notification-service-queue"
  message_retention_seconds = 86400 # 1 day
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.platform_dlq.arn
    maxReceiveCount     = 5 # Move to DLQ after 5 failed retries
  })
}

# Decision Maker Service Queue
resource "aws_sqs_queue" "decision_queue" {
  name                      = "dev-decision-service-queue"
  message_retention_seconds = 86400
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.platform_dlq.arn
    maxReceiveCount     = 5
  })
}

# Investigation Service Queue
resource "aws_sqs_queue" "investigation_queue" {
  name                      = "dev-investigation-service-queue"
  message_retention_seconds = 86400
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.platform_dlq.arn
    maxReceiveCount     = 5
  })
}

# Event Store Service Queue (Audit / Replay)
resource "aws_sqs_queue" "event_store_queue" {
  name                      = "dev-event-store-service-queue"
  message_retention_seconds = 1209600
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.platform_dlq.arn
    maxReceiveCount     = 5
  })
}

# ------------------------------------------------------------------------------
# 4. SQS QUEUE POLICIES (ALLOW EVENTBRIDGE TO PUBLISH TO SQS)
# ------------------------------------------------------------------------------
data "aws_iam_policy_document" "sqs_eventbridge_policy" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }
    actions   = ["sqs:SendMessage"]
    resources = ["*"]
  }
}

resource "aws_sqs_queue_policy" "notification_queue_policy" {
  queue_url = aws_sqs_queue.notification_queue.id
  policy    = data.aws_iam_policy_document.sqs_eventbridge_policy.json
}

resource "aws_sqs_queue_policy" "decision_queue_policy" {
  queue_url = aws_sqs_queue.decision_queue.id
  policy    = data.aws_iam_policy_document.sqs_eventbridge_policy.json
}

resource "aws_sqs_queue_policy" "investigation_queue_policy" {
  queue_url = aws_sqs_queue.investigation_queue.id
  policy    = data.aws_iam_policy_document.sqs_eventbridge_policy.json
}

resource "aws_sqs_queue_policy" "event_store_queue_policy" {
  queue_url = aws_sqs_queue.event_store_queue.id
  policy    = data.aws_iam_policy_document.sqs_eventbridge_policy.json
}

# ------------------------------------------------------------------------------
# 5. EVENTBRIDGE RULES & TARGET ROUTING
# ------------------------------------------------------------------------------

# Rule 1: Send Notification-related events to Notification Queue
resource "aws_cloudwatch_event_rule" "notification_rule" {
  name           = "dev-route-notification-events"
  event_bus_name = aws_cloudwatch_event_bus.platform_bus.name

  event_pattern = jsonencode({
    "detail-type" = ["IssueCreated", "VoteSubmitted", "DecisionApproved", "InvestigationOpened"]
  })
}

resource "aws_cloudwatch_event_target" "notification_target" {
  rule           = aws_cloudwatch_event_rule.notification_rule.name
  event_bus_name = aws_cloudwatch_event_bus.platform_bus.name
  arn            = aws_sqs_queue.notification_queue.arn
}

# Rule 2: Route "IssueCreated" events to Decision Maker Queue
resource "aws_cloudwatch_event_rule" "decision_rule" {
  name           = "dev-route-decision-events"
  event_bus_name = aws_cloudwatch_event_bus.platform_bus.name

  event_pattern = jsonencode({
    "detail-type" = ["IssueCreated", "VoteSubmitted"]
  })
}

resource "aws_cloudwatch_event_target" "decision_target" {
  rule           = aws_cloudwatch_event_rule.decision_rule.name
  event_bus_name = aws_cloudwatch_event_bus.platform_bus.name
  arn            = aws_sqs_queue.decision_queue.arn
}

# Rule 3: Catch-All Rule to capture EVERY domain event into the Event Store DB Queue
resource "aws_cloudwatch_event_rule" "event_store_all_rule" {
  name           = "dev-route-all-events-to-event-store"
  event_bus_name = aws_cloudwatch_event_bus.platform_bus.name

  event_pattern = jsonencode({
    "source" = [{"prefix" = "enterprise.platform"}]
  })
}

resource "aws_cloudwatch_event_target" "event_store_target" {
  rule           = aws_cloudwatch_event_rule.event_store_all_rule.name
  event_bus_name = aws_cloudwatch_event_bus.platform_bus.name
  arn            = aws_sqs_queue.event_store_queue.arn
}
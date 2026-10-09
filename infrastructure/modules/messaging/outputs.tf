output "event_bus_arn" {
  value       = aws_cloudwatch_event_bus.platform_bus.arn
  description = "ARN of the EventBridge Custom Event Bus"
}

output "event_bus_name" {
  value       = aws_cloudwatch_event_bus.platform_bus.name
  description = "Name of the EventBridge Custom Event Bus"
}

output "notification_queue_url" {
  value = aws_sqs_queue.notification_queue.id
}

output "decision_queue_url" {
  value = aws_sqs_queue.decision_queue.id
}

output "investigation_queue_url" {
  value = aws_sqs_queue.investigation_queue.id
}

output "event_store_queue_url" {
  value = aws_sqs_queue.event_store_queue.id
}
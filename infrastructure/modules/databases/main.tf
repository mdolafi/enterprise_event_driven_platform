variable "private_subnet_ids" { type = list(string) }
variable "vpc_id"             { type = string }

# DB Subnet Group for RDS
resource "aws_db_subnet_group" "rds" {
  name       = "dev-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = { Name = "dev-db-subnet-group" }
}

# DB Security Group
resource "aws_security_group" "rds_sg" {
  name        = "dev-rds-security-group"
  description = "Allow inbound traffic to RDS instances"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Allow internal VPC traffic
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 5 PostgreSQL DB Instances (Issue, Vote, Decision, Notification, Investigation)
variable "db_names" {
  default = ["issue_db", "vote_db", "decision_db", "notification_db", "investigation_db"]
}

resource "aws_db_instance" "postgres" {
  for_each               = toset(var.db_names)
  identifier             = "dev-platform-${replace(each.key, "_", "-")}"
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = "db.t3.micro" # Free tier / low cost for dev sandbox
  db_name                = each.key
  username               = "dbadmin"
  password               = "SuperSecretPassword123!" # In prod, use Secrets Manager
  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  skip_final_snapshot    = true
}
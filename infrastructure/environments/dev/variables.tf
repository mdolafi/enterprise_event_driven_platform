variable "aws_region" {
  description = "AWS Region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "dev"
}

variable "db_instance_class" {
  description = "RDS instance class (Sandbox optimized)"
  type        = string
  default     = "db.t4g.micro" # Cost-effective for dev/sandbox
}

variable "allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_master_username" {
  description = "Master username for PostgreSQL"
  type        = string
  default     = "postgres_admin"
}

variable "db_master_password" {
  description = "Master password for PostgreSQL"
  type        = string
  sensitive   = true
}

variable "microservice_databases" {
  description = "List of microservice logical databases to create"
  type        = list(string)
  default = [
    "db_issues",
    "db_votes",
    "db_decisions",
    "db_users",
    "db_notifications",
    "db_investigations",
    "db_attachments",
    "db_events"
  ]
}
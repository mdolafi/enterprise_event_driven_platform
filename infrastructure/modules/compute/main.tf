variable "vpc_id"            { type = string }
variable "public_subnet_ids" { type = list(string) }

# ECS Cluster to run backend processing services
resource "aws_ecs_cluster" "main" {
  name = "dev-ecs-cluster"
}

output "ecs_cluster_id" {
  value = aws_ecs_cluster.main.id
}

output "alb_dns_name" {
  value = "not-applicable"
}
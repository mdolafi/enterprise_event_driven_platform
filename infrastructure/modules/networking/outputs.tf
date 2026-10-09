# Inside infrastructure/modules/networking/outputs.tf

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = data.aws_subnets.all.ids
}
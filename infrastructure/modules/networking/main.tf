# 1. Fetch Existing VPC
data "aws_vpc" "alb_vpc" {
  id = "vpc-0c373da06fd32974f"
}

# 2. Fetch All Subnet IDs for this VPC
data "aws_subnets" "all" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.alb_vpc.id]
  }
}

# 3. Outputs expected by parent environment
output "vpc_id" {
  value = data.aws_vpc.alb_vpc.id
}

output "public_subnet_ids" {
  value = data.aws_subnets.all.ids
}
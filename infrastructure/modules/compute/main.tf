variable "vpc_id"            { type = string }
variable "public_subnet_ids" { type = list(string) }

# Security Group for Load Balancer
resource "aws_security_group" "alb_sg" {
  name        = "dev-alb-security-group"
  description = "Allow public web traffic"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Elastic IP for NAT Gateway
resource "aws_eip" "nat" {
  domain = "vpc"
}

# NAT Gateway for Private Subnets
resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = var.public_subnet_ids[0]

  tags = { Name = "dev-nat-gateway" }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "dev-platform-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = var.public_subnet_ids

  tags = { Name = "dev-platform-alb" }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "dev-ecs-cluster"
}
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

module "networking" {
  source = "../../modules/networking"
}

module "storage" {
  source = "../../modules/storage"
}

module "registries" {
  source = "../../modules/registries"
}
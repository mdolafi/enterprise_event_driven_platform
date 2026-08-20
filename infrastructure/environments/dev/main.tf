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

module "databases" {
  source             = "../../modules/databases"
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
}

module "compute" {
  source            = "../../modules/compute"
  vpc_id            = module.networking.vpc_id
  public_subnet_ids = module.networking.public_subnet_ids
}
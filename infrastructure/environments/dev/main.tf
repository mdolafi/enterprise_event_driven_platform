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
  db_names = [
    "issue_db",
    "vote_db",
    "decision_db",
    "notification_db",
    "investigation_db",
    "attachment_db",
    "event_store_db",
    "user_db"
   ]
}

module "compute" {
  source            = "../../modules/compute"
  vpc_id            = module.networking.vpc_id
  public_subnet_ids = module.networking.public_subnet_ids
}

module "messaging" {
  source = "../../modules/messaging"
}
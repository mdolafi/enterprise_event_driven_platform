variable "services" {
  default = ["submitter", "voter", "decision-maker", "notification", "investigation", "attachment"]
}

resource "aws_ecr_repository" "repos" {
  for_each             = toset(var.services)
  name                 = "dev-platform-${each.key}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}
resource "aws_s3_bucket" "attachments" {
  bucket_prefix = "dev-platform-attachments-"
  force_destroy = true

  tags = {
    Name = "dev-platform-files-and-attachments"
  }
}

resource "aws_s3_bucket_public_access_block" "attachments_block" {
  bucket = aws_s3_bucket.attachments.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "bucket_name" { value = aws_s3_bucket.attachments.id }
output "bucket_arn"  { value = aws_s3_bucket.attachments.arn }
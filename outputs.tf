output "frontend_website_endpoint" {
  value = aws_s3_bucket_website_configuration.frontend_bucket_website.website_endpoint
}

output "backend_ecr_repository_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "vpc_id" {
  description = "Kartify VPC ID"
  value       = aws_vpc.kartify_vpc.id
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.kartify_alb.dns_name
}

output "s3_bucket_name" {
  description = "Frontend S3 bucket name"
  value       = aws_s3_bucket.frontend_bucket.bucket
}

output "s3_website_endpoint" {
  description = "Frontend S3 website endpoint"
  value       = aws_s3_bucket.frontend_bucket.website_endpoint
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.kartify_cluster.name
}

output "ecs_service_name" {
  description = "ECS backend service name"
  value       = aws_ecs_service.backend.name
}

output "mongodb_private_ip" {
  description = "MongoDB EC2 private IP"
  value       = aws_instance.mongodb.private_ip
}
resource "aws_internet_gateway" "kartify_internet_gateway" {
  vpc_id = aws_vpc.kartify_vpc.id

  tags = {
    Name        = "${var.project_name}-internet-gateway"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
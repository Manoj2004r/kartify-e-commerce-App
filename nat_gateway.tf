resource "aws_eip" "kartify_nat_eip" {
  domain = "vpc"

  tags = {
    Name        = "${var.project_name}-nat-eip"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_nat_gateway" "kartify_nat_gateway" {
  allocation_id = aws_eip.kartify_nat_eip.id
  subnet_id     = aws_subnet.public_subnets[0].id
  depends_on    = [aws_internet_gateway.kartify_internet_gateway]

  tags = {
    Name        = "${var.project_name}-nat-gateway"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
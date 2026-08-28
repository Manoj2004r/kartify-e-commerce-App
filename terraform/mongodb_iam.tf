resource "aws_iam_role" "mongodb" {
  name = "${var.project_name}-mongodb-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "ec2.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-mongodb-role"
  }
}

resource "aws_iam_role_policy_attachment" "mongodb_ssm" {
  role = aws_iam_role.mongodb.name

  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "mongodb" {
  name = "${var.project_name}-mongodb-profile"
  role = aws_iam_role.mongodb.name

  tags = {
    Name = "${var.project_name}-mongodb-profile"
  }
}
resource "aws_instance" "mongodb" {
  ami           = "ami-07e5ce642bbc48c0d"
  instance_type = "t3.micro"

  subnet_id = aws_subnet.private_subnets[0].id

  vpc_security_group_ids = [
    aws_security_group.mongo_db.id
  ]

  associate_public_ip_address = false

  iam_instance_profile = aws_iam_instance_profile.mongodb.name
  user_data = <<-EOF
  #!/bin/bash

  # Update packages
  apt-get update -y

  # Install required packages
  apt-get install -y gnupg curl

  # Add MongoDB GPG key
  curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
    gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg

  # Add MongoDB repository
  echo "deb [ arch=amd64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" \
    > /etc/apt/sources.list.d/mongodb-org-8.0.list

  # Update repository information
  apt-get update -y

  # Install MongoDB
  apt-get install -y mongodb-org

  # Start MongoDB
  systemctl start mongod

  # Start MongoDB automatically after reboot
  systemctl enable mongod
EOF
  root_block_device {
    volume_size = 20
    volume_type = "gp3"

    encrypted = true
  }

  tags = {
    Name = "${var.project_name}-mongodb"
  }
}
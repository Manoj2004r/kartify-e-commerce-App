resource "aws_secretsmanager_secret" "mongodb" {
  name = "${var.project_name}-mongodb-secret"

  tags = {
    Name = "${var.project_name}-mongodb-secret"
  }
}

resource "aws_secretsmanager_secret_version" "mongodb" {
  secret_id = aws_secretsmanager_secret.mongodb.id

  secret_string = jsonencode({
    MONGO_URI = "mongodb://${aws_instance.mongodb.private_ip}:27017/kartify"
  })
}

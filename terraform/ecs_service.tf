resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-backend-service"
  cluster         = aws_ecs_cluster.kartify_cluster.id
  task_definition = aws_ecs_task_definition.backend.arn

  desired_count = 2

  launch_type = "FARGATE"

  enable_execute_command = true

  network_configuration {
    subnets = [
      aws_subnet.private_subnets[0].id,
      aws_subnet.private_subnets[1].id
    ]

    security_groups = [
      aws_security_group.ecs.id
    ]

    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "${var.project_name}-backend"
    container_port   = 5000
  }

  depends_on = [
    aws_lb_listener.backend,
    aws_secretsmanager_secret_version.mongodb
  ]

  tags = {
    Name = "${var.project_name}-backend-service"
  }
}

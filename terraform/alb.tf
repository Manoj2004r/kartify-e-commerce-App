resource "aws_lb" "kartify_alb" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"

  security_groups = [
    aws_security_group.alb.id
  ]

  subnets = [
    aws_subnet.public_subnets[0].id,
    aws_subnet.public_subnets[1].id
  ]

  tags = {
    Name = "${var.project_name}-alb"
  }
}

resource "aws_lb_listener" "backend" {
  load_balancer_arn = aws_lb.kartify_alb.arn

  port     = 80
  protocol = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}
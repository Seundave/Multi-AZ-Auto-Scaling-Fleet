# 1. Application Load Balancer (Public-facing)

resource "aws_lb" "app_alb" {
  name               = "multi-az-app-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]

  enable_deletion_protection = false

  tags = {
    Name = "multi-az-app-alb"
  }
}

# 2. Target Group (Routes traffic to EC2 instances on port 8080 using /health)
resource "aws_lb_target_group" "app_tg" {
  name        = "multi-az-app-tg"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "instance"

  health_check {
    enabled             = true
    protocol            = "HTTP"
    port                = 8080
    path                = "/health"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  tags = {
    Name = "multi-az-app-tg"
  }
}

# 3. HTTP Listener (Listens on port 80 and forwards traffic to the Target Group)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
}

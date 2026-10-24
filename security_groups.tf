# 1. Security Group for the Application Load Balancer (ALB)

resource "aws_security_group" "alb" {
  name        = "multi-az-alb-sg"
  description = "Control traffic entering and leaving the load balancer"
  vpc_id      = aws_vpc.main.id

  # Inbound: Allow HTTP (TCP 80) from anywhere
  ingress {
    description = "Allow HTTP from public internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  #   # Outbound: Allow traffic to the application EC2 instances on port 8080
  #   egress {
  #     description = "Allow traffic to app EC2 on port 8080"
  #     from_port   = 8080
  #     to_port     = 8080
  #     protocol    = "tcp"
  #     cidr_blocks = [aws_security_group.ec2.id]
  #   }

    tags = {
      Name = "multi-az-alb-sg"
    }
}

# 2. Security Group for the Private Application EC2 Instances
resource "aws_security_group" "ec2" {
  name        = "multi-az-app-ec2-sg"
  description = "Protect private application instances"
  vpc_id      = aws_vpc.main.id

  # Inbound: Allow traffic from the ALB on port 8080
  ingress {
    description     = "Allow traffic only from ALB"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Outbound: Allow all outbound HTTPS/HTTP connectivity needed for SSM and package bootstrap
  egress {
    description = "Allow all outbound traffic for updates and SSM"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "multi-az-app-ec2-sg"
  }
}

# 3. BREAK THE CYCLE: Add the ALB egress rule as a separate resource
resource "aws_security_group_rule" "alb_to_ec2_egress" {
  type                     = "egress"
  description              = "Allow traffic to app EC2 on port 8080"
  from_port                = 8080
  to_port                  = 8080
  protocol                 = "tcp"
  security_group_id        = aws_security_group.alb.id # Attached to ALB
  source_security_group_id = aws_security_group.ec2.id # References EC2
}


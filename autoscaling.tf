resource "aws_autoscaling_group" "app_asg" {
  name_prefix      = "multi-az-app-asg-"
  min_size         = 2
  max_size         = 4
  desired_capacity = 2

  # Distribute capacity across both private subnets for multi-AZ resilience
  vpc_zone_identifier = [aws_subnet.private_a.id, aws_subnet.private_b.id]

  # Integrate directly with your ALB target group
  target_group_arns = [aws_lb_target_group.app_tg.arn]

  # Use ELB health checks so failing HTTP responses trigger instance replacement
  health_check_type         = "ELB"
  health_check_grace_period = 300 # 5 minutes for git clone, npm ci, and app startup

  launch_template {
    id      = aws_launch_template.app_instance.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "multi-az-app-asg-instance"
    propagate_at_launch = true
  }

}

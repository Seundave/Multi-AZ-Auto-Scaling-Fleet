resource "aws_launch_template" "app_instance" {
  name_prefix   = "multi-az-app-instance-"
  image_id      = "ami-06337f27770313698"
  instance_type = "t3.micro"

  # 1. IAM Instance Profile for SSM Session Manager access
  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_profile.name
  }

  # 2. Security Group (No SSH, accepts traffic strictly from the ALB security group)
  vpc_security_group_ids = [aws_security_group.ec2.id]

  # 3. External Bootstrap Script Integration (Base64 encoded from user_data.sh)
  user_data = base64encode(file("${path.module}/user_data.sh"))

  # 4. Metadata Security: Enforce IMDSv2 (Zero IMDSv1 fallback)
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required" # Mandatory IMDSv2
    http_put_response_hop_limit = 1
  }

  # 5. Instance Tagging
  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "multi-az-fleet-monitor-instance"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

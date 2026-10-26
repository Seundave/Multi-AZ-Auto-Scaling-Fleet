resource "aws_instance" "test_app_instance" {
  # Launch in Private Subnet A (10.0.11.0/24)
  # Note: Adjust 'aws_subnet.private_a.id' if your vpc.tf uses a different resource name

  subnet_id = aws_subnet.private_a.id

  # Bind to your reusable Launch Template
  launch_template {
    id      = aws_launch_template.app_instance.id
    version = aws_launch_template.app_instance.latest_version
  }

  tags = {
    Name = "multi-az-fleet-monitor-test"
  }
}

# iam_ec2.tf

# 1. IAM Role for EC2 Instances
resource "aws_iam_role" "ec2_ssm" {
  name = "multi-az-ec2-ssm-role"

  assume_role_policy = jsonencode({
    version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "multi-az-ec2-ssm-role"
  }
}


# 2. Attach the AWS-managed SSM Core policy for Session Manager
resource "aws_iam_role_policy_attachment" "ssm_server" {
  role       = aws_iam_role.ec2_ssm.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# 3. Instance Profile to pass the role to EC2
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "multi-az-ec2-instance-profile"
  role = aws_iam_role.ec2_ssm.name
}

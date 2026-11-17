resource "aws_lambda_function" "fleet_overview" {
  function_name = "multi-az-fleet-overview"
  description   = "Read only monitoring API for the Multi-AZ fleet"

  role    = aws_iam_role.lambda_monitoring.arn
  runtime = "nodejs24.x"
  handler = "src/handler.handler"

  filename         = "${path.module}/lambda-deployment.zip"
  source_code_hash = filebase64sha256("${path.module}/lambda-deployment.zip")

  memory_size = 256
  timeout     = 15

  environment {
    variables = {
      ASG_NAME         = aws_autoscaling_group.app_asg.name
      TARGET_GROUP_ARN = aws_lb_target_group.app_tg.arn
    }
  }

  tags = {
    Name        = "multi-az-fleet-overview"
    Environment = "monitoring"
  }

}
resource "aws_apigatewayv2_api" "fleet_api" {
  name          = "multi-az-fleet-api"
  protocol_type = "HTTP"

  description = "HTTP API for the Multi-AZ Fleet Monitoring Dashboard"

  cors_configuration {
    allow_origins = ["http://localhost:5173"]
    allow_methods = ["GET"]
    allow_headers = ["content-type", "authorization"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_integration" "fleet_lambda" {
  api_id                 = aws_apigatewayv2_api.fleet_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.fleet_overview.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "fleet_get" {
  api_id    = aws_apigatewayv2_api.fleet_api.id
  route_key = "GET /fleet"
  target    = "integrations/${aws_apigatewayv2_integration.fleet_lambda.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.fleet_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "allow_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.fleet_overview.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.fleet_api.execution_arn}/*/GET/fleet"
}

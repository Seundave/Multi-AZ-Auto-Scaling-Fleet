resource "aws_sns_topic" "fleet_alerts" {
  name = "multi-az-fleet-alerts"
}

resource "aws_sns_topic_subscription" "fleet_alerts_email" {
  topic_arn = aws_sns_topic.fleet_alerts.arn
  protocol  = "email"
  endpoint  = "olaleyedavid323@gmail.com"
}

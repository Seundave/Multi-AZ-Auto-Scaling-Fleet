resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name        = "multi-az-fleet-high-cpu"
  alarm_description = "Triggers when average CPU utilization across the Auto Scaling Group exceeds 70% for five minutes."

  namespace   = "AWS/EC2"
  metric_name = "CPUUtilization"
  statistic   = "Average"
  period      = 300 # 5 minutes

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.app_asg.name
  }

  evaluation_periods  = 1
  datapoints_to_alarm = 1
  threshold           = 70
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "missing"

  alarm_actions = [aws_sns_topic.fleet_alerts.arn]
}


resource "aws_cloudwatch_metric_alarm" "unhealthy_targets" {
  alarm_name        = "multi-az-fleet-unhealthy-targets"
  alarm_description = "Alert when instances are unhealthy "

  namespace   = "AWS/ApplicationELB"
  metric_name = "UnHealthyHostCount"
  statistic   = "Maximum"
  period      = 60 # 1 minute

  dimensions = {
    TargetGroup  = aws_lb_target_group.app_tg.arn_suffix
    LoadBalancer = aws_lb.app_alb.arn_suffix
  }

  evaluation_periods  = 1
  datapoints_to_alarm = 1
  threshold           = 0
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "missing"

  alarm_actions = [aws_sns_topic.fleet_alerts.arn]
}


resource "aws_cloudwatch_metric_alarm" "low_capacity" {
  alarm_name        = "multi-az-fleet-low-capacity"
  alarm_description = "Alert when the number of InService instances in the Auto Scaling Group falls below the minimum capacity of two."

  namespace   = "AWS/AutoScaling"
  metric_name = "GroupInServiceInstances"
  statistic   = "Minimum"
  period      = 60 # 1 minute

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.app_asg.name
  }

  evaluation_periods  = 3
  datapoints_to_alarm = 2
  threshold           = 2
  comparison_operator = "LessThanThreshold"
  treat_missing_data  = "missing"

  alarm_actions = [aws_sns_topic.fleet_alerts.arn]
}

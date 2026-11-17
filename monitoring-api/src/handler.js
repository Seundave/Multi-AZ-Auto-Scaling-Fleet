const {
  AutoScalingClient,
  DescribeAutoScalingGroupsCommand,
} = require("@aws-sdk/client-auto-scaling");
const { EC2Client, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");
const {
  ElasticLoadBalancingV2Client,
  DescribeTargetHealthCommand,
} = require("@aws-sdk/client-elastic-load-balancing-v2");

// Initialize AWS service clients
const autoScalingClient = new AutoScalingClient({});
const ec2Client = new EC2Client({});
const elbv2Client = new ElasticLoadBalancingV2Client({});

const validateEnvironment = () => {
  const requiredVariables = ["ASG_NAME", "TARGET_GROUP_ARN"];

  const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable],
  );

  return missingVariables;
};

const createResponse = (statusCode, data) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
});

exports.handler = async (event) => {
  const missingVariables = validateEnvironment();

  if (missingVariables.length > 0) {
    return createResponse(500, {
      message: "Server configuration error",
      missingVariables,
    });
  }

  try {
    const result = await autoScalingClient.send(
      new DescribeAutoScalingGroupsCommand({
        AutoScalingGroupNames: [process.env.ASG_NAME],
      }),
    );

    const group = result.AutoScalingGroups?.[0];

    // console.log(group,"group");

    if (!group) {
      return createResponse(404, {
        message: "Auto Scaling Group not found",
      });
    }

    const instanceIds = (group.Instances || []).map(
      (instance) => instance.InstanceId,
    );

    // console.log("Instance IDs:", instanceIds);

    const ec2Results =
      instanceIds.length > 0
        ? await ec2Client.send(
            new DescribeInstancesCommand({ InstanceIds: instanceIds }),
          )
        : { Reservations: [] };

    // console.log("EC2 Results:", JSON.stringify(ec2Results, null, 2));

    const ec2Instances = (ec2Results.Reservations || []).flatMap(
      (reservation) => reservation.Instances || [],
    );

    const asgInstances = new Map(
      (group.Instances || []).map((instance) => [
        instance.InstanceId,
        instance,
      ]),
    );

    // console.log("asg Instances:", asgInstances);

    const targetHealthResults = await elbv2Client.send(
      new DescribeTargetHealthCommand({
        TargetGroupArn: process.env.TARGET_GROUP_ARN,
      }),
    );

    // console.log(
    //   "Target Health Results:",
    //   JSON.stringify(targetHealthResults, null, 2),
    // );

    const targetHealthDescriptions =
      targetHealthResults.TargetHealthDescriptions || [];

    const healthyTargets = targetHealthDescriptions.filter(
      (target) => target.TargetHealth?.State === "healthy",
    ).length;

    // console.log("Healthy Targets:", healthyTargets);

    const unhealthyTargets = targetHealthDescriptions.filter(
      (target) => target.TargetHealth?.State === "unhealthy",
    ).length;

    const fleet = {
      name: group.AutoScalingGroupName,
      minSize: group.MinSize,
      maxSize: group.MaxSize,
      desiredCapacity: group.DesiredCapacity,
      healthyTargets,
      unhealthyTargets,
      instances: ec2Instances.map((instance) => ({
        instanceId: instance.InstanceId,
        privateIp: instance.PrivateIpAddress,
        instanceType: instance.InstanceType,
        availabilityZone: instance.Placement?.AvailabilityZone,
        ec2State: instance.State?.Name,
        lifecycleState: asgInstances.get(instance.InstanceId)?.LifecycleState,
      })),
    };

    // console.log("Fleet:", JSON.stringify(fleet, null, 2));

    return createResponse(200, fleet);
  } catch (error) {
    console.error("Failed to retrieve fleet information:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return createResponse(500, {
      message: "Unable to retrieve fleet information",
    });
  }
};

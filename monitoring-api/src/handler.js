const {
  AutoScalingClient,
  DescribeAutoScalingGroupsCommand,
} = require("@aws-sdk/client-auto-scaling");
const { EC2Client, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");
const {
  ElasticLoadBalancingV2Client,
} = require("@aws-sdk/client-elastic-load-balancing-v2");

// Initialize AWS service clients
const autoScalingClient = new AutoScalingClient({});
const ec2Client = new EC2Client({});
const elbv2Client = new ElasticLoadBalancingV2Client({});

exports.handler = async (event) => {
  try {
    const result = await autoScalingClient.send(
      new DescribeAutoScalingGroupsCommand({
        AutoScalingGroupNames: [process.env.ASG_NAME],
      }),
    );

    const group = result.AutoScalingGroups[0];

    // console.log(group,"group");

    if (!group) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Auto Scaling Group not found",
        }),
      };
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

    const fleet = {
      name: group.AutoScalingGroupName,
      minSize: group.MinSize,
      maxSize: group.MaxSize,
      desiredCapacity: group.DesiredCapacity,
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

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fleet),
    };
  } catch (error) {
    console.log("Failed to retrieve Autoscaling group", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to retrieve Autoscaling group",
        error: error.message,
      }),
    };
  }
};

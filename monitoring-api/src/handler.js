const {
  AutoScalingClient,
  DescribeAutoScalingGroupsCommand,
} = require("@aws-sdk/client-auto-scaling");
const { EC2Client } = require("@aws-sdk/client-ec2");
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

    if (!group) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Auto Scaling Group not found",
        }),
      };
    }

    const fleet = {
      name: group.AutoScalingGroupName,
      minSize: group.MinSize,
      maxSize: group.MaxSize,
      desiredCapacity: group.DesiredCapacity,
      instances: (group.Instances || []).map((instance) => ({
        instanceId: instance.InstanceId,
        availabilityZone: instance.AvailabilityZone,
        lifecycleState: instance.LifecycleState,
      })),
    };

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

// exports.handler = async (event) => {
//   return {
//     statusCode: 200,
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       message: "Fleet Monitoring API is running",
//       status: "success",
//     }),
//   };
// };

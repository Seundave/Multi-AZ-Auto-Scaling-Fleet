# Multi-AZ Auto-Scaling Fleet Monitor

A highly available AWS infrastructure project that provisions a multi-AZ application fleet with automatic scaling, health monitoring, automated instance recovery, and a custom monitoring dashboard built with React.

This project demonstrates how to combine AWS infrastructure automation with application-level monitoring by building a complete cloud environment and developing a dashboard to visualize the health, capacity, and distribution of the fleet.

## Architecture Overview

The infrastructure is deployed across multiple Availability Zones to improve availability and resilience.

The application instances run in private subnets, while the Application Load Balancer is publicly accessible. An Auto Scaling Group manages the EC2 fleet, automatically adjusting capacity based on CPU utilization and replacing unhealthy instances.

A separate monitoring API retrieves infrastructure information from AWS services and exposes it to a React dashboard.

### Architecture Flow


                         Internet
                            |
                            v
                 Application Load Balancer
                            |
             +--------------+--------------+
             |                             |
             v                             v
       Private Subnet A              Private Subnet B
       eu-north-1a                   eu-north-1b
             |                             |
         EC2 Instance                 EC2 Instance
             |                             |
             +--------------+--------------+
                            |
                  Auto Scaling Group
                            |
                 Target Tracking Policy
                    (CPU - 50%)


### Monitoring Architecture


        React Dashboard
              |
              | HTTP Request
              v
        Amazon API Gateway
              |
              v
        AWS Lambda (Node.js)
              |
       +------+-------+----------------+
       |              |               |
       v              v               v
 Auto Scaling      Amazon EC2       ELBv2
   API              API             API
       |              |               |
       +--------------+---------------+
                      |
                      v
               Fleet Information
                      |
                      v
                React Dashboard


## Technologies Used

### Infrastructure & Cloud

- AWS
- Terraform
- Amazon VPC
- Public and Private Subnets
- Internet Gateway
- NAT Gateway
- Application Load Balancer (ALB)
- Amazon EC2
- EC2 Auto Scaling Group
- AWS Systems Manager (Session Manager)
- Amazon CloudWatch
- Amazon SNS
- AWS Lambda
- Amazon API Gateway
- IAM

### Monitoring API

- Node.js
- JavaScript
- AWS SDK for JavaScript v3
- Lambda ZIP deployment

### Frontend Dashboard

- React
- JavaScript
- Vite
- CSS
- Fetch API

## Infrastructure Features

### Multi-AZ Deployment

- Deploys infrastructure across two Availability Zones.
- Distributes EC2 instances across private subnets in different AZs.
- Uses an Application Load Balancer deployed in public subnets.
- Provides availability through infrastructure distribution.

### Auto Scaling

- EC2 Auto Scaling Group with a minimum capacity of 2 instances.
- Desired capacity of 2 instances.
- Maximum capacity of 4 instances.
- CPU-based target tracking scaling policy.
- Target average CPU utilization of 50%.
- Automatically replaces unhealthy instances.

### Load Balancing & Health Checks

- Application Load Balancer distributes traffic across EC2 instances.
- Target group health checks monitor application availability.
- Unhealthy instances are removed from traffic and replaced through the Auto Scaling Group's health monitoring process.

### Security

- EC2 instances deployed in private subnets.
- No public IP addresses assigned to application instances.
- SSH access not required.
- Instance access managed through AWS Systems Manager Session Manager.
- IMDSv2 required on EC2 instances.
- Security groups control inbound and outbound traffic.
- Encrypted EBS volumes.
- IAM roles provide permissions without hardcoded AWS credentials.

### Monitoring & Alerting

CloudWatch alarms monitor key infrastructure conditions:

- High EC2 CPU utilization.
- Low Auto Scaling Group capacity.
- Unhealthy load balancer targets.

Amazon SNS delivers alarm notifications through email.

## Custom Fleet Monitoring Dashboard

Instead of relying solely on the AWS Console to inspect infrastructure, I built a custom dashboard that retrieves fleet information through a dedicated monitoring API.

### Monitoring API

The API is built with AWS Lambda and Node.js, using the AWS SDK to retrieve information from:

- **Amazon EC2:** Instance IDs, private IP addresses, instance types, Availability Zones, and instance states.
- **EC2 Auto Scaling:** Desired capacity, minimum capacity, maximum capacity, and instance lifecycle states.
- **Elastic Load Balancing:** Healthy and unhealthy target counts.

Amazon API Gateway exposes the Lambda function through an HTTP endpoint that the frontend consumes.

### Dashboard Features

- Fleet capacity overview.
- Desired fleet capacity.
- Healthy and unhealthy load balancer targets.
- Running EC2 instance count.
- Fleet operational status.
- Dynamic Availability Zone distribution.
- EC2 instance details table.
- Fleet health checks.
- Automatic data refresh every 30 seconds.
- Manual refresh functionality.
- Loading state while retrieving fleet information.
- Responsive interface.

### Fleet Status

The dashboard evaluates fleet information and displays an overall status:

| Status | Description |
|---|---|
| Operational | Fleet capacity and health checks meet the expected conditions. |
| Degraded | The fleet is available but one or more expected health conditions are not fully satisfied. |
| Unavailable | The fleet or its healthy targets are unavailable. |

## Project Structure

Multi-AZ-Auto-Scaling-Fleet/
│
├── dashboard/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AvailabilityZones.jsx
│   │   │   ├── DashboardHeader.jsx
│   │   │   ├── FleetHealthSummary.jsx
│   │   │   ├── InstanceTable.jsx
│   │   │   └── MetricCard.jsx
││   │   ├── services/
││   │   │   └── fleetApi.js
││   │   ├── App.jsx
││   │   ├── App.css
││   │   └── index.css
││   ├── .env.example
││   └── package.json
│
├── monitoring-api/
│   ├── src/
│   │   └── handler.js
│   └── package.json
│
├── terraform/
│   └── Infrastructure configuration files
│
├── user_data/
│   └── user_data.sh
│
├── .gitignore
└── README.md


*The directory structure may vary slightly depending on the current implementation.*

## Deployment

### Prerequisites

Ensure the following are installed and configured:

- AWS CLI
- Terraform
- Node.js and npm
- Git
- An AWS account
- Configured AWS credentials with appropriate permissions

### 1. Clone the Repository

git clone https://github.com/Seundave/Multi-AZ-Auto-Scaling-Fleet.git

cd Multi-AZ-Auto-Scaling-Fleet


### 2. Deploy the AWS Infrastructure

Initialize Terraform:

terraform init


Review the planned infrastructure changes:

terraform plan


Deploy the infrastructure:

terraform apply

Review the changes and confirm when prompted.

### 3. Configure the Monitoring API

The monitoring API requires the appropriate environment variables to identify the Auto Scaling Group and target group.

Example:

ASG_NAME=your-auto-scaling-group-name
TARGET_GROUP_ARN=your-target-group-arn

The Lambda execution role must have the required read permissions for:

- Auto Scaling
- EC2
- Elastic Load Balancing

### 4. Deploy the Monitoring API

The monitoring API is packaged for Lambda deployment as a ZIP file containing the handler, dependencies, and package files.

Install dependencies:

cd monitoring-api
npm install

Package the deployment:

zip -r ../lambda-deployment.zip src node_modules package.json package-lock.json

The Lambda function and API Gateway endpoint are provisioned through Terraform.

### 5. Configure the Dashboard

Navigate to the dashboard directory:

cd dashboard


Install dependencies:

npm install

Create a `.env` file:

VITE_API_BASE_URL=https://your-api-id.execute-api.your-region.amazonaws.com

The API base URL should point to your deployed API Gateway endpoint.

### 6. Run the Dashboard Locally

Start the development server:

npm run dev

Open the local URL provided by Vite, typically:

http://localhost:5173

The dashboard retrieves fleet information from the monitoring API and updates automatically every 30 seconds.

## Infrastructure Testing

The project was tested against several operational scenarios to verify the behavior of the infrastructure.

| Test | Expected Behavior |
|---|---|
| Normal operation | Instances remain healthy and registered with the target group. |
| CPU load increase | Auto Scaling launches additional EC2 instances when scaling conditions are met. |
| CPU load reduction | Fleet scales back toward the desired capacity. |
| Unhealthy target | Load balancer detects an unhealthy target. |
| Instance failure | Auto Scaling replaces an unhealthy or terminated instance. |
| Capacity monitoring | CloudWatch detects capacity below the configured threshold. |
| Alarm notification | SNS sends email notifications for triggered alarms. |
| API request | Monitoring API returns current fleet information. |
| Dashboard refresh | Dashboard retrieves and displays updated fleet data. |

## Architectural Decisions & Trade-offs

### Single NAT Gateway

A single NAT Gateway was used to reduce infrastructure costs.

While this provides outbound internet connectivity to instances in private subnets, it introduces an Availability Zone dependency and is not a fully AZ-independent NAT architecture.

### Separate Monitoring API

The monitoring functionality was implemented as a separate Lambda-based API instead of modifying the application running on the EC2 fleet.

This provides separation between the application workload and the monitoring functionality, while allowing the dashboard to retrieve AWS infrastructure information directly through AWS service APIs.

### Lambda Outside the VPC

The monitoring Lambda function does not need to run inside the application VPC. It communicates with AWS service APIs using IAM permissions, avoiding the need for VPC networking and NAT connectivity for the monitoring function.

### Infrastructure as Code

Terraform was used to provision and manage the infrastructure, making the environment reproducible and allowing changes to be reviewed before deployment.

## Future Improvements

- Add CloudWatch CPU utilization metrics to the dashboard.
- Visualize Auto Scaling activities and scaling events.
- Add historical fleet metrics and charts.
- Implement monitoring API authentication and authorization.
- Improve API error handling and retry behavior.
- Add dashboard resilience for failed API requests.
- Implement HTTPS for the application endpoint using ACM and a domain.
- Improve AZ-level resilience by introducing NAT Gateway redundancy.
- Add automated testing and deployment pipelines using CI/CD.

## What I Learned

This project provided practical experience in:

- Designing multi-AZ AWS infrastructure.
- Deploying workloads in private subnets.
- Managing infrastructure using Terraform.
- Configuring Auto Scaling and target tracking policies.
- Understanding load balancer health checks and instance replacement.
- Using IAM roles for secure AWS service access.
- Monitoring infrastructure through CloudWatch and SNS.
- Building serverless APIs using Lambda and API Gateway.
- Retrieving infrastructure information through AWS SDKs.
- Integrating AWS infrastructure data with a React frontend.
- Applying frontend development skills to cloud infrastructure observability.

One of the key takeaways from this project was understanding that building cloud infrastructure is only part of the work. Being able to observe, interpret, and monitor the behavior of that infrastructure is equally important.

## Author

**David Olaleye**


- GitHub: [@Seundave](https://github.com/Seundave)
- Portfolio: [olaleyedavid.vercel.app](https://olaleyedavid.vercel.app/)

---

*Built as a hands-on cloud engineering project to explore infrastructure design, automation, resilience, monitoring, and the integration of cloud services with frontend technologies.*

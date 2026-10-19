
# 🛒 Kartify — AWS E-Commerce Deployment with DevOps Automation

An e-commerce application deployed on AWS using Infrastructure as Code, containerization, and CI/CD practices. This project demonstrates cloud infrastructure provisioning, application deployment, networking, secrets management, and troubleshooting.

## 📌 Project Overview

Kartify consists of a React frontend, a Node.js/Express backend, and a MongoDB database. The frontend is hosted on Amazon S3, the backend runs on Amazon ECS with AWS Fargate, and MongoDB runs on an EC2 instance in a private subnet.

Terraform is used to provision AWS infrastructure, while Jenkins automates deployment workflows.

### Key Objectives

- Provision AWS infrastructure using Terraform.
- Containerize the backend using Docker.
- Deploy backend containers using Amazon ECS and AWS Fargate.
- Store backend container images in Amazon ECR.
- Host the static frontend on Amazon S3.
- Configure traffic routing using an Application Load Balancer.
- Isolate application and database resources using VPC subnets and security groups.
- Manage sensitive application configuration using AWS Secrets Manager.
- Automate infrastructure and application deployment using Jenkins.

## 🏗️ Architecture

![Kartify AWS Architecture](docs/architecture/kartify-architecture.png)

### Architecture Components

| Component | Purpose |
|---|---|
| Amazon S3 | Hosts the compiled React frontend |
| Amazon VPC | Provides network isolation for AWS resources |
| Public Subnets | Host internet-facing resources and networking components |
| Private Subnets | Host ECS backend tasks and the MongoDB EC2 instance |
| Internet Gateway | Enables internet connectivity for resources using public routing |
| NAT Gateway | Provides outbound internet access for resources in private subnets when configured |
| Application Load Balancer | Routes incoming API traffic to backend targets |
| Amazon ECS | Manages backend container workloads |
| AWS Fargate | Runs backend containers without managing the underlying servers |
| Amazon ECR | Stores backend Docker images |
| Amazon EC2 | Hosts the MongoDB database |
| AWS Secrets Manager | Stores sensitive application configuration |
| Terraform | Provisions and manages infrastructure as code |
| Jenkins | Automates build, deployment, and infrastructure workflows |

> **Frontend routing note:** The frontend is hosted directly on S3. S3 static website hosting does not reverse-proxy `/api/*` requests to the ALB. If the frontend uses relative API paths, configure a suitable reverse proxy or update the frontend to call the publicly reachable HTTPS API endpoint. Configure HTTPS separately if using an S3 website endpoint.

## 🔄 Application Request Flow

1. The user opens the React frontend hosted on Amazon S3.
2. The frontend sends API requests to the backend endpoint.
3. The Application Load Balancer routes requests to the ECS Fargate backend.
4. The Node.js backend processes the request and communicates with MongoDB.
5. MongoDB returns the requested data to the backend.
6. The backend returns the API response to the frontend.

The database is not accessed directly by the browser. Database connectivity is restricted to the backend.

## 🔧 Technology Stack

### Cloud
- Amazon Web Services (AWS)
- Amazon S3
- Amazon VPC
- Amazon EC2
- Amazon ECS and AWS Fargate
- Amazon ECR
- Application Load Balancer
- AWS IAM
- AWS Secrets Manager

### DevOps and Automation
- Terraform
- Jenkins
- Docker
- Git and GitHub
- Linux
- Bash

### Application
- React
- Node.js
- Express.js
- MongoDB

## 📁 Repository Structure

```text
kartify/
├── backend/
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   └── Dockerfile
├── docs/
│   └── architecture/
│       └── kartify-architecture.png
├── terraform/
│   ├── provider.tf
│   ├── vpc.tf
│   ├── subnets.tf
│   ├── route_tables.tf
│   ├── internet_gateway.tf
│   ├── nat_gateway.tf
│   ├── security_groups.tf
│   ├── alb.tf
│   ├── alb_target_group.tf
│   ├── ecs.tf
│   ├── ecs_service.tf
│   ├── ecs_task_defination.tf
│   ├── ecr.tf
│   ├── s3.tf
│   ├── secrets.tf
│   ├── mongodb.tf
│   ├── iam.tf
│   ├── variables.tf
│   └── outputs.tf
├── Jenkinsfile
├── .gitignore
└── README.md
```

> Update this tree to match the actual files and folders in your repository. Include the Terraform state-locking configuration and additional IAM files if they exist, but never commit Terraform state files or credentials.

## ⚙️ Prerequisites

Before deploying the project, ensure you have:

- An AWS account with appropriate permissions.
- AWS CLI installed and configured.
- Terraform installed.
- Docker installed.
- Node.js and npm for local application development.
- Jenkins with the required pipeline, Git, and deployment tools.
- Git and GitHub access.

Use an IAM role for AWS authentication where possible. Avoid hardcoding access keys in scripts or pipeline files.

## 🚀 Deployment Workflow

### 1. Infrastructure Provisioning

Terraform provisions the required AWS infrastructure, including:

- VPC, subnets, route tables, and gateways.
- Security groups and networking rules.
- Application Load Balancer and target group.
- ECS cluster, task definition, and service.
- ECR repository.
- S3 frontend bucket.
- MongoDB EC2 infrastructure.
- IAM roles and Secrets Manager integration.

Example commands:

```bash
cd terraform
terraform init
terraform fmt -check
terraform validate
terraform plan
terraform apply
```

Review the plan before applying changes. Configure remote state and state locking for collaborative or production environments.

### 2. Backend Containerization

The backend is a Node.js application that listens on port 5000 by default.

Build and test the backend image locally:

```bash
cd backend
docker build -t kartify-backend .
docker run --rm -p 5000:5000 kartify-backend
```

Supply the required environment variables through a secure configuration mechanism when running the application. Do not bake secrets into the image.

### 3. Backend Image Publishing

The backend Docker image is published to Amazon ECR.

Typical workflow:

1. Authenticate Docker to ECR using AWS CLI.
2. Build the backend image.
3. Tag the image with the ECR repository URI.
4. Push the image to ECR.
5. Update the ECS task definition to use the new image.
6. Deploy the updated task definition through the ECS service.

Use unique image tags, such as a Git commit SHA, instead of relying exclusively on `latest`.

### 4. Frontend Build and Deployment

The frontend uses Vite and must be compiled into static files before deployment.

```bash
cd frontend
npm ci
npm run build
```

The build output is generated in `frontend/dist/`.

Upload the generated files to the configured S3 bucket using the deployment process defined for the project. Ensure the frontend API URL and hosting configuration are correct for the deployed environment.

### 5. Jenkins CI/CD

The Jenkins workflow can automate:

1. Checking out the source code from GitHub.
2. Validating Terraform configuration.
3. Building the backend Docker image.
4. Publishing the image to ECR.
5. Updating the ECS service.
6. Building the frontend.
7. Uploading frontend assets to S3.
8. Running deployment verification checks.

Terraform infrastructure changes should be reviewed before approval and application.

The exact pipeline stages depend on the Jenkinsfile implemented in the repository.

## 🔐 Security Considerations

- Store `JWT_SECRET` and sensitive MongoDB connection strings in AWS Secrets Manager.
- Inject secrets into ECS tasks at runtime rather than embedding them in Docker images.
- Use IAM roles and least-privilege permissions.
- Restrict database access to the backend's security group on port 27017.
- Do not expose MongoDB publicly.
- Restrict administrative access to EC2 and other infrastructure.
- Avoid committing `.env` files, credentials, private keys, Terraform state, or secret values.
- Use HTTPS for public application traffic with an appropriate certificate and routing configuration.
- Enable database authentication and review backup and recovery requirements before production use.

## 🩺 Health Checks and Troubleshooting

The backend exposes the following health endpoints:

| Endpoint | Purpose |
|---|---|
| `/health/live` | Checks whether the backend process is responding |
| `/health/ready` | Checks whether the backend is ready, including MongoDB connectivity |

Useful troubleshooting commands:

```bash
docker ps
docker logs <container-name>
docker inspect <container-name>
aws ecs describe-services --cluster <cluster-name> --services <service-name>
aws ecs describe-tasks --cluster <cluster-name> --tasks <task-id>
```

Check the ECS service events, target group health, security group rules, application logs, and database connectivity when troubleshooting deployment failures.

## 🌱 Database Initialization

Kartify provides a seed script for inserting demo products and user accounts.

Run the seed operation as a separate, intentional task after confirming database connectivity. Do not run it automatically every time the backend starts.

Use demo credentials only in non-production environments and never publish real passwords or production database connection strings.

## 📈 Possible Future Improvements

- Add CloudFront and HTTPS for secure, scalable frontend delivery.
- Introduce automated tests and deployment quality gates.
- Add image vulnerability scanning and dependency checks.
- Implement Prometheus and Grafana monitoring where appropriate.
- Improve database security, backups, and recovery procedures.
- Use automated rollback strategies and deployment health verification.
- Evaluate managed database options for production workloads.

These are potential improvements, not claims that the features are already implemented.

## 🎯 Key Learning Outcomes

- AWS cloud networking and infrastructure provisioning.
- Infrastructure as Code using Terraform.
- Containerization and image management with Docker and ECR.
- Application deployment using ECS and AWS Fargate.
- CI/CD automation using Jenkins.
- Secure configuration and secrets management.
- Troubleshooting application, networking, and deployment issues.

## 👨‍💻 Author

**Manoj R**

- GitHub: [Manoj2004r](https://github.com/Manoj2004r)
- LinkedIn: https://www.linkedin.com/in/manoj-r-369o
- Email: manojr3690@gmail.com

---

*This project is intended for learning and demonstrating cloud infrastructure and DevOps practices. Review security, availability, and cost requirements before using the architecture for production workloads.*

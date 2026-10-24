# Terraform Infrastructure — Kartify

## Overview

This directory contains Terraform configuration for provisioning the AWS infrastructure used by the Kartify e-commerce application.

## Infrastructure Components

- **Amazon VPC:** Network isolation and subnet configuration.
- **Subnets and routing:** Network placement and traffic routing.
- **Security groups:** Network access controls between application components.
- **Application Load Balancer:** Routes incoming requests to the backend service.
- **Amazon ECS with AWS Fargate:** Runs the containerized backend.
- **Amazon ECR:** Stores backend container images.
- **Amazon S3:** Hosts the frontend static assets.
- **IAM:** Defines permissions for AWS services and workloads.
- **AWS Secrets Manager:** Stores sensitive application configuration when configured.

## Deployment Workflow

1. Configure the AWS provider and required variables.
2. Initialize Terraform.
3. Review the proposed infrastructure changes.
4. Apply the configuration after reviewing the plan.
5. Verify the deployed resources in the AWS Management Console.

## Security Considerations

- Avoid committing AWS access keys, passwords, tokens, or database credentials.
- Use IAM roles and least-privilege permissions where possible.
- Store sensitive values in an approved secrets-management service.
- Review Terraform plans before applying infrastructure changes.
- Protect Terraform state because it may contain sensitive values.
- Review security group rules and avoid unnecessary public access.

## Important Notes

Resource names, regions, variables, and deployment steps depend on the actual configuration in this repository. Review the Terraform files before applying changes. This documentation does not itself deploy infrastructure.

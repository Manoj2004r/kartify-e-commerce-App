pipeline {

    agent any

    environment {
        AWS_REGION     = 'aws-region'
        AWS_ACCOUNT    = 'aws-account-id'

        ECR_REPOSITORY = 'kartify-backend'

        ECS_CLUSTER    = 'kartify-cluster'
        ECS_SERVICE    = 'kartify-backend-service'

        IMAGE_TAG      = "${env.GIT_COMMIT}"
        ECR_IMAGE      = "${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${env.GIT_COMMIT}"
    }

    options {
        timestamps()
        ansiColor('xterm')
        disableConcurrentBuilds()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm

                sh '''
                    echo "Commit: ${GIT_COMMIT}"
                    git status
                '''
            }
        }

        stage('Backend Install') {
            steps {
                dir('backend') {
                    sh '''
                        npm install
                    '''
                }
            }
        }

        stage('Syntax Check') {
            steps {
                dir('backend') {
                    sh '''
                        echo "Checking JavaScript syntax..."

                        find src -name "*.js" -print0 | while IFS= read -r -d '' file
                        do
                            node --check "$file"
                        done

                        echo "Syntax check passed."
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    echo "Building image:"
                    echo "${ECR_IMAGE}"

                    docker build \
                        -t "${ECR_IMAGE}" \
                        ./backend
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                    echo "Scanning Docker image..."

                    trivy image \
                        --severity HIGH,CRITICAL \
                        --ignore-unfixed \
                        --exit-code 0 \
                        "${ECR_IMAGE}"
                '''
            }
        }

        stage('ECR Login') {
            steps {
                sh '''
                    aws ecr get-login-password \
                        --region "${AWS_REGION}" |
                    docker login \
                        --username AWS \
                        --password-stdin \
                        "${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                '''
            }
        }

        stage('Push Image') {
            steps {
                sh '''
                    docker push "${ECR_IMAGE}"
                '''
            }
        }

        stage('Register ECS Task Definition') {
            steps {
                script {

                    sh '''
                        echo "Getting current ECS task definition..."

                        aws ecs describe-task-definition \
                            --task-definition kartify-backend \
                            --region "${AWS_REGION}" \
                            --query 'taskDefinition' \
                            > task-definition.json

                        echo "Updating image..."

                        jq --arg IMAGE "${ECR_IMAGE}" \
                            '.containerDefinitions[0].image = $IMAGE
                             | del(
                                 .taskDefinitionArn,
                                 .revision,
                                 .status,
                                 .requiresAttributes,
                                 .compatibilities,
                                 .registeredAt,
                                 .registeredBy
                               )' \
                            task-definition.json \
                            > new-task-definition.json

                        echo "Registering new task definition..."

                        aws ecs register-task-definition \
                            --cli-input-json file://new-task-definition.json \
                            --region "${AWS_REGION}" \
                            > registered-task-definition.json

                        NEW_TASK_DEFINITION=$(jq -r '.taskDefinition.taskDefinitionArn' registered-task-definition.json)

                        echo "New task definition:"
                        echo "${NEW_TASK_DEFINITION}"

                        echo "${NEW_TASK_DEFINITION}" > new-task-definition-arn.txt
                    '''
                }
            }
        }

        stage('Run Database Seed') {
            steps {
                sh '''
                    set -e

                    echo "Getting ECS network configuration..."

                    aws ecs describe-services \
                        --cluster "${ECS_CLUSTER}" \
                        --services "${ECS_SERVICE}" \
                        --region "${AWS_REGION}" \
                        --query 'services[0].networkConfiguration.awsvpcConfiguration' \
                        > network-config.json

                    SUBNETS=$(jq -r '.subnets | join(",")' network-config.json)
                    SECURITY_GROUPS=$(jq -r '.securityGroups | join(",")' network-config.json)

                    echo "Subnets: ${SUBNETS}"
                    echo "Security Groups: ${SECURITY_GROUPS}"

                    TASK_DEFINITION=$(cat new-task-definition-arn.txt)

                    echo "Running seed task..."

                    aws ecs run-task \
                        --cluster "${ECS_CLUSTER}" \
                        --task-definition "${TASK_DEFINITION}" \
                        --launch-type FARGATE \
                        --network-configuration "awsvpcConfiguration={subnets=[${SUBNETS}],securityGroups=[${SECURITY_GROUPS}],assignPublicIp=DISABLED}" \
                        --overrides '{"containerOverrides":[{"name":"kartify-backend","command":["node","src/seed/seed.js"]}]}' \
                        --region "${AWS_REGION}" \
                        > seed-task.json

                    SEED_TASK_ARN=$(jq -r '.tasks[0].taskArn' seed-task.json)

                    if [ "${SEED_TASK_ARN}" = "null" ] || [ -z "${SEED_TASK_ARN}" ]; then
                        echo "Failed to start seed task."
                        cat seed-task.json
                        exit 1
                    fi

                    echo "Seed task:"
                    echo "${SEED_TASK_ARN}"

                    echo "${SEED_TASK_ARN}" > seed-task-arn.txt
                '''
            }
        }

        stage('Wait For Seed') {
            steps {
                sh '''
                    set -e

                    SEED_TASK_ARN=$(cat seed-task-arn.txt)

                    echo "Waiting for seed task to finish..."

                    aws ecs wait tasks-stopped \
                        --cluster "${ECS_CLUSTER}" \
                        --tasks "${SEED_TASK_ARN}" \
                        --region "${AWS_REGION}"

                    EXIT_CODE=$(aws ecs describe-tasks \
                        --cluster "${ECS_CLUSTER}" \
                        --tasks "${SEED_TASK_ARN}" \
                        --region "${AWS_REGION}" \
                        --query 'tasks[0].containers[0].exitCode' \
                        --output text)

                    echo "Seed exit code: ${EXIT_CODE}"

                    if [ "${EXIT_CODE}" != "0" ]; then
                        echo "Database seed failed."
                        exit 1
                    fi

                    echo "Database seed completed successfully."
                '''
            }
        }

        stage('Deploy ECS') {
            steps {
                sh '''
                    set -e

                    TASK_DEFINITION=$(cat new-task-definition-arn.txt)

                    echo "Deploying:"
                    echo "${TASK_DEFINITION}"

                    aws ecs update-service \
                        --cluster "${ECS_CLUSTER}" \
                        --service "${ECS_SERVICE}" \
                        --task-definition "${TASK_DEFINITION}" \
                        --region "${AWS_REGION}"

                    echo "Waiting for ECS service to become stable..."

                    aws ecs wait services-stable \
                        --cluster "${ECS_CLUSTER}" \
                        --services "${ECS_SERVICE}" \
                        --region "${AWS_REGION}"

                    echo "ECS deployment completed."
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    set -e

                    echo "Checking backend health..."

                    for i in $(seq 1 10)
                    do
                        STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
                            "http://kartify-alb-1072041883.ap-south-1.elb.amazonaws.com/health/ready" \
                            || true)

                        echo "Attempt ${i}: HTTP ${STATUS}"

                        if [ "${STATUS}" = "200" ]; then
                            echo "Backend health check passed."
                            exit 0
                        fi

                        sleep 10
                    done

                    echo "Backend health check failed."
                    exit 1
                '''
            }
        }
    }

    post {

        success {
            echo "========================================"
            echo " Backend deployment successful!"
            echo " Image: ${ECR_IMAGE}"
            echo "========================================"
        }

        failure {
            echo "========================================"
            echo " Backend deployment FAILED!"
            echo "========================================"
        }

        always {
            sh '''
                echo "Cleaning Docker image..."

                docker rmi "${ECR_IMAGE}" || true
            '''
        }
    }
}


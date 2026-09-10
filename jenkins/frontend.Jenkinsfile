pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        S3_BUCKET  = 'kartify-frontend-bucket-293174400265'
        S3_WEBSITE = 'http://kartify-frontend-bucket-293174400265.s3-website.ap-south-1.amazonaws.com'
        VITE_API_URL = 'http://kartify-alb-1072041883.ap-south-1.elb.amazonaws.com/api'
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
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Lint') {
            steps {
                dir('frontend') {
                    sh 'npm run lint'
                }
            }
        }

        stage('Build') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy to S3') {
            steps {
                dir('frontend') {
                    sh '''
                        aws s3 sync dist/ s3://${S3_BUCKET}/ \
                            --region ${AWS_REGION} \
                            --delete
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    echo "Checking frontend deployment..."

                    HTTP_CODE=$(curl -L -s -o /dev/null -w "%{http_code}" \
                        "${S3_WEBSITE}")

                    echo "HTTP Status: ${HTTP_CODE}"

                    if [ "$HTTP_CODE" != "200" ]; then
                        echo "Frontend deployment verification failed!"
                        exit 1
                    fi

                    echo "Frontend deployment verified successfully."
                '''
            }
        }
    }

    post {
        success {
            echo 'Frontend pipeline completed successfully!'
            echo "Frontend URL: ${S3_WEBSITE}"
        }

        failure {
            echo 'Frontend pipeline failed!'
        }

        always {
            sh 'rm -rf frontend/node_modules frontend/dist || true'
        }
    }
}

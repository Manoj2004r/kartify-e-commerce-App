pipeline {
    agent any

    environment {
        AWS_REGION = 'aws-region'
        S3_BUCKET  = 's3-bucket-name'
        S3_WEBSITE = 'http://s3-bucket-website'
        VITE_API_URL = 'http://aws-alb'
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

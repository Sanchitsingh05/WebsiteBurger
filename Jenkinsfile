pipeline {
    agent { label 'docker-node' }

    options {
        skipDefaultCheckout()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    environment {
        JIRA_EMAIL = 'sanchit05march@gmail.com'         // Replace with your Jira email
        JIRA_API_TOKEN = 'ATATT3xFfGF0xFADZsr3l8Cje9JgrkdkAY_36pOsu2MfC61L0FpUJBRPcPVwS-8-GE2ymiAL46-HNYUPQnle4JNAymHNbPEurkHnsi6eipVPmmU36UTEo_IoWQb8IDSmVQU5JCepR9QckC0cXDGNnSN86zMRQ1_TJIwalliFIm65hXmK__IPeNA=33CCE860'             // Replace with your Jira API token
        JIRA_DOMAIN = 'https://sanchit05march.atlassian.net/'     // Replace with your Jira domain
        JIRA_ISSUE = 'JP-1'                           // Replace with your Jira issue key
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image..."
                    sh 'docker build -t websiteburger:latest .'
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    echo "Running dummy tests..."
                    sh 'echo "All tests passed!"'
                }
            }
        }

        stage('Deploy (Optional)') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "Deploying WebsiteBurger (main branch only)..."
                    // Example: docker run -d -p 80:80 websiteburger:latest
                }
            }
        }
    }

    post {
        success {
            script {
                sh """
                curl -X POST \
                  -u ${JIRA_EMAIL}:${JIRA_API_TOKEN} \
                  -H "Content-Type: application/json" \
                  --data '{
                    "update": {
                      "comment": [
                        {
                          "add": {
                            "body": "✅ Jenkins build #${BUILD_NUMBER} succeeded for WebsiteBurger. View details in Jenkins."
                          }
                        }
                      ]
                    }
                  }' \
                  https://${JIRA_DOMAIN}/rest/api/3/issue/${JIRA_ISSUE}
                """
            }
        }
        failure {
            script {
                sh """
                curl -X POST \
                  -u ${JIRA_EMAIL}:${JIRA_API_TOKEN} \
                  -H "Content-Type: application/json" \
                  --data '{
                    "update": {
                      "comment": [
                        {
                          "add": {
                            "body": "❌ Jenkins build #${BUILD_NUMBER} failed for WebsiteBurger. Please investigate."
                          }
                        }
                      ]
                    }
                  }' \
                  https://${JIRA_DOMAIN}/rest/api/3/issue/${JIRA_ISSUE}
                """
            }
        }
    }
}

pipeline {
    agent { label 'docker-node' }  // All builds run on your Docker slave node
    environment {
        IMAGE_NAME = "burger-webapp"
        IMAGE_TAG = "latest"
    }
    stages {
        stage('Checkout') {
            steps {
                // Checkout the current branch
                git branch: "${env.BRANCH_NAME}",
                    url: 'https://github.com/Sanchitsingh05/Website-burger.git',
                    credentialsId: 'github-cred'
            }
        }
        stage('Build Docker Image') {
            steps {
                // Build Docker image
                sh "docker build -t $IMAGE_NAME:$IMAGE_TAG ."
            }
        }
        stage('Run Container for Testing') {
            steps {
                // Stop any running container first
                sh "docker stop burger || true"
                sh "docker rm burger || true"
                sh "docker run -d --name burger -p 80:80 $IMAGE_NAME:$IMAGE_TAG"
            }
        }
        stage('Post Build Status to Jira') {
            steps {
                // Requires Jira plugin configuration
                jiraSendBuildInfo site: 'JiraCloud', buildStatus: currentBuild.currentResult
            }
        }
    }
    post {
        success {
            echo 'Build and deploy succeeded!'
        }
        failure {
            echo 'Build failed!'
        }
    }
}

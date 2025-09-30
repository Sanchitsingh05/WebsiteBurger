pipeline {
    agent { label 'docker-node' }  // Run builds only on docker-node
 
    options {
        skipDefaultCheckout() // avoid duplicate git checkout
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }
 
    stages {
        stage('Checkout') {
            steps {
                checkout scm  // Jenkins automatically checks out the branch
            }
        }
 
        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image..."
                    sh 'sudo docker build -t websiteburger:latest .'
                }
            }
        }
 
        stage('Run Tests') {
            steps {
                script {
                    echo "Running tests (dummy for now)..."
                    sh 'echo "Tests passed!"'
                }
            }
        }
 
        stage('Deploy (Optional)') {
            when { branch 'main' }
            steps {
                script {
                    echo "Deploying app (main branch only)..."
                    // You could run docker run -d here or push to DockerHub
                }
            }
        }
    }
 
    post {
        success {
            echo "Build succeeded. Updating Jira..."
        }
        failure {
            echo "Build failed. Updating Jira..."
        }
    }
}

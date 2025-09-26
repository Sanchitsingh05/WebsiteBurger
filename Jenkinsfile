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
                    sh 'docker build -t websiteburger:latest .'
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
        jiraSendBuildInfo(
            site: 'JiraCloud',   // must match the site name you configured in Jenkins
            issueKey: 'JP-1',    // your Jira story/issue key
            buildNumber: currentBuild.number.toString(),
            buildDisplayName: currentBuild.displayName,
            buildState: 'Successful'
        )
    }
    failure {
        jiraSendBuildInfo(
            site: 'JiraCloud',
            issueKey: 'JP-1',
            buildNumber: currentBuild.number.toString(),
            buildDisplayName: currentBuild.displayName,
            buildState: 'Failed'
        )
    }
}

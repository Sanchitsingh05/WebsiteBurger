pipeline {
  agent { label 'docker-node' }       // ensures the build runs on the docker-node agent
  environment {
    IMAGE = "websiteburger:${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Build Docker Image') {
      steps {
        sh 'docker build -t $IMAGE .'
      }
    }
    stage('Smoke test') {
      steps {
        sh '''
          docker run -d --name smoke_test $IMAGE
          sleep 3
          if ! curl -f http://localhost:8080; then
            docker logs smoke_test || true
            docker rm -f smoke_test || true
            exit 1
          fi
          docker rm -f smoke_test || true
        '''
      }
    }
    stage('Publish (optional)') {
      steps { echo "Push image to registry step if you want (docker push ...)" }
    }
  }
  post {
    success {
      echo "Build successful - you can add Jira update here"
    }
    failure {
      echo "Build failed"
    }
  }
}

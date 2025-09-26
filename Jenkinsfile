pipeline {
  agent { label 'docker-node' }

  environment {
    IMAGE = "websiteburger:${env.GIT_COMMIT?.substring(0,7)}"
    CONTAINER_NAME = "websiteburger_running"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker image') {
      steps {
        echo "Building Docker image ${IMAGE}"
        sh 'docker build -t ${IMAGE} .'
      }
    }
    stage('Deploy') {
      steps {
        sh '''
          # Stop and remove any old running container
          docker rm -f ${CONTAINER_NAME} || true

          # Run the new container in detached mode
          docker run -d --name ${CONTAINER_NAME} -p 8080:80 ${IMAGE}
        '''
        echo "✅ Application deployed at: http://<DOCKER_NODE_IP>:8080"
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: '**/*.html', allowEmptyArchive: true
      script { jiraSendBuildInfo() }
    }
  }
}


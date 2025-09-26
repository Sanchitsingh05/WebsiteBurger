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

    stage('Smoke Test') {
      steps {
        sh '''
          # Run a temporary container to test the build
          docker run --rm -d --name tmp_test -p 8081:80 ${IMAGE}
          sleep 2
          curl -f http://localhost:8081 || (docker logs tmp_test; exit 1)
          docker stop tmp_test || true
        '''
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

On Fri, Sep 26, 2025 at 2:46 PM Abhin Shyam <abhinshyam2003@gmail.com> wrote:
pipeline {
  agent { label 'docker-node' }       // ensure this node label matches the one we'll create
  environment {
    IMAGE = "websiteburger:${env.GIT_COMMIT?.substring(0,7)}"
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Build image') {
      steps {
        echo "Building Docker image ${IMAGE}"
        sh 'docker build -t ${IMAGE} .'
      }
    }
    stage('Smoke test container') {
      steps {
        sh '''
          docker run --rm -d --name tmp_website -p 8080:80 ${IMAGE} || exit 1
          sleep 2
          curl -f http://localhost:8080 || (docker logs tmp_website; exit 1)
          docker stop tmp_website || true
        '''
      }
    }
  }
  post {
    always {
      archiveArtifacts artifacts: '**/*.html', allowEmptyArchive: true
      // send build info to Jira (Atlassian plugin). If you have multiple Jira sites configured, pass site: 'yoursite.atlassian.net'
      script {
        // plugin step that posts build data to Jira
        jiraSendBuildInfo()
      }
    }
  }
}

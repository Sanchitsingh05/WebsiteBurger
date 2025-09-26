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

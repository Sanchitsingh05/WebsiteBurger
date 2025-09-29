pipeline {
  agent { label 'docker-node' }
 
  environment {
    IMAGE = "websiteburger:${env.GIT_COMMIT?.substring(0,7)}"
  }
 
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
 
    stage('Mark Pending in GitHub') {
      steps {
        script {
          // requires pipeline-githubnotify-step plugin
          githubNotify context: 'ci/WebsiteBurger/build', status: 'PENDING', description: 'Build started on Jenkins'
        }
      }
    }
 
    stage('Build Docker image') {
      steps {
        sh 'docker build -t ${IMAGE} .'
      }
    }
 
    stage('Smoke test') {
      steps {
        script {
          sh '''
            docker run -d --name tmp_site -p 8082:80 ${IMAGE}
            sleep 2
            curl -fsS http://localhost:8082 || (docker logs tmp_site; exit 1)
            docker rm -f tmp_site || true
          '''
        }
      }
    }
  }
 
  post {
    success {
      script {
        githubNotify context: 'ci/WebsiteBurger/build', status: 'SUCCESS', description: 'Build succeeded'
        // send build info to Jira (Atlassian plugin)
        jiraSendBuildInfo site: 'https://sanchit05march.atlassian.net/'
      }
    }
    failure {
      script {
        githubNotify context: 'ci/WebsiteBurger/build', status: 'FAILURE', description: 'Build failed'
        jiraSendBuildInfo site: 'https://sanchit05march.atlassian.net/'
      }
    }
  }
}

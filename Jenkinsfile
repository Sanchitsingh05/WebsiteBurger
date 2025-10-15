pipeline {
  agent any

  environment {
    REGISTRY_CREDENTIALS = 'dockerhub-creds' // Jenkins credential ID (username + password for Docker Hub)
    DOCKER_IMAGE = "sanchit0305/burger-website"
    SONARQUBE_SERVER = 'sonarqube-local'     // Name you will configure in Jenkins Global config
  }

  options {
    skipDefaultCheckout(true)
    timestamps()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          def commit = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
          env.IMAGE_TAG = "${env.BRANCH_NAME}-${commit}"
        }
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('sonarqube-local') {
          sh '''
            if ! command -v sonar-scanner >/dev/null 2>&1; then
              echo "Installing sonar-scanner for this run..."
              curl -sSLo sonar.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
              unzip -q sonar.zip
              export PATH="$PWD/sonar-scanner-*/bin:$PATH"
            fi
            sonar-scanner \
              -Dsonar.projectKey=burger-website \
              -Dsonar.sources=. \
              -Dsonar.host.url=$SONAR_HOST_URL \
              -Dsonar.login=$SONAR_AUTH_TOKEN || true
          '''
        }
      }
    }

    stage('Build Docker image') {
      steps {
        sh '''
          docker build -t ${DOCKER_IMAGE}:${IMAGE_TAG} .
          docker tag ${DOCKER_IMAGE}:${IMAGE_TAG} ${DOCKER_IMAGE}:latest
        '''
      }
    }

    stage('Push to Docker Hub') {
      steps {
        script {
          docker.withRegistry('', REGISTRY_CREDENTIALS) {
            sh """
              docker push ${DOCKER_IMAGE}:${IMAGE_TAG}
              docker push ${DOCKER_IMAGE}:latest
            """
          }
        }
      }
    }

    stage('Deploy with Helm to Minikube') {
      steps {
        sh '''
          kubectl config current-context
          helm upgrade --install burger-website ./helm/burger-website \
            --namespace burger --create-namespace \
            --set image.repository=${DOCKER_IMAGE} \
            --set image.tag=${IMAGE_TAG} \
            --set service.nodePort=30080

          kubectl -n burger rollout status deploy/burger-website --timeout=120s
        '''
      }
    }
  }

  post {
    success {
      echo "Deployed => http://${env.EC2_PUBLIC_IP?:'EC2_PUBLIC_IP'}:30080/"
    }
    always {
      cleanWs()
    }
  }
}

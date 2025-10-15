pipeline {
  agent any

  environment {
    REGISTRY_CREDENTIALS = 'dockerhub-creds'               // Jenkins creds -> Docker Hub (username: sanchit0305, password: PAT)
    DOCKER_IMAGE        = 'sanchit0305/burger-website'
    // SONARQUBE_SERVER not needed; we use withSonarQubeEnv('sonarqube-local')
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

    // --- Temporary probe to verify Jenkins can reach SonarQube on localhost:9000 ---
    stage('Ping Sonar from Jenkins') {
      steps {
        sh '''#!/usr/bin/env bash
set -e
echo "[INFO] Probing SonarQube from Jenkins node…"
curl -sf http://localhost:9000/api/system/status && echo
'''
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('sonarqube-local') {
          // OPTION 1: Download CLI (robust tgz/zip fallback)
          sh '''#!/usr/bin/env bash
set -euo pipefail

SCANNER_VERSION="5.0.1.3006"
BASE="https://binaries.sonarsource.com/Distribution/sonar-scanner-cli"
TGZ_URL="${BASE}/sonar-scanner-cli-${SCANNER_VERSION}-linux-x64.tar.gz"
ZIP_URL="${BASE}/sonar-scanner-cli-${SCANNER_VERSION}-linux.zip"

rm -f sonar.tgz sonar.zip || true

echo "[INFO] Trying tar.gz from SonarSource…"
if curl -fLsS -o sonar.tgz "$TGZ_URL"; then
  if tar -tzf sonar.tgz >/dev/null 2>&1; then
    tar -xzf sonar.tgz
    SCANNER_HOME="$(tar -tzf sonar.tgz | head -1 | cut -d/ -f1)"
  else
    echo "[WARN] Downloaded tar is not a valid gzip, will try ZIP…"
    rm -f sonar.tgz
    curl -fLsS -o sonar.zip "$ZIP_URL"
    unzip -oq sonar.zip
    SCANNER_HOME="$(unzip -Z1 sonar.zip | head -1 | cut -d/ -f1)"
  fi
else
  echo "[INFO] tar.gz not available, falling back to ZIP…"
  curl -fLsS -o sonar.zip "$ZIP_URL"
  unzip -oq sonar.zip
  SCANNER_HOME="$(unzip -Z1 sonar.zip | head -1 | cut -d/ -f1)"
fi

export PATH="$PWD/${SCANNER_HOME}/bin:$PATH"

sonar-scanner \
  -Dsonar.projectKey=burger-website \
  -Dsonar.sources=. \
  -Dsonar.host.url="$SONAR_HOST_URL" \
  -Dsonar.login="$SONAR_AUTH_TOKEN" || true
'''

          // --- OPTION 2 (simpler): Dockerized scanner, no downloads ---
          // sh '''#!/usr/bin/env bash
          // docker run --rm --network=host \
          //   -e SONAR_HOST_URL="$SONAR_HOST_URL" \
          //   -e SONAR_TOKEN="$SONAR_AUTH_TOKEN" \
          //   -v "$PWD:/usr/src" \
          //   sonarsource/sonar-scanner-cli
          // '''
        }
      }
    }

    // Optional: Fail fast if Quality Gate is red (needs Sonar webhook to Jenkins /sonarqube-webhook/)
    // stage('Quality Gate') {
    //   steps {
    //     timeout(time: 5, unit: 'MINUTES') {
    //       waitForQualityGate abortPipeline: true
    //     }
    //   }
    // }

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
            sh '''
              docker push ${DOCKER_IMAGE}:${IMAGE_TAG}
              docker push ${DOCKER_IMAGE}:latest
            '''
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

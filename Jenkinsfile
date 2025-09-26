// Jenkinsfile - place at repo root

pipeline {

  agent { label 'docker-node' }

  environment {

    IMAGE_NAME = "websiteburger"

    JIRA_SITE = 'JIRA'                    // Name configured in Jenkins -> Configure System -> Jira

    DOCKER_CREDS = 'dockerhub-creds'      // Jenkins credentials id for Docker registry (change if different)

  }

  stages {

    stage('Checkout') {

      steps {

        // Multibranch job will set BRANCH_NAME automatically

        checkout scm

        script {

          // ensure we have a commit id for tagging

          env.SHORT_COMMIT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()

          // extract JIRA issue key like ABC-123 from branch name; empty if not found

          env.ISSUE_KEY = sh(script: "echo ${env.BRANCH_NAME} | grep -oE '[A-Z]+-[0-9]+' || true", returnStdout: true).trim()

        }

      }

    }

    stage('Build Docker Image') {

      steps {

        script {

          echo "Building image ${IMAGE_NAME}:${env.SHORT_COMMIT}"

          sh "docker build -t ${IMAGE_NAME}:${env.SHORT_COMMIT} ."

        }

      }

    }

    stage('Validate / Tests') {

      steps {

        // Put your test commands here. For static site it might be linting or smoke check.

        sh 'echo "No unit tests configured - add test steps here if needed"'

      }

    }

    stage('Push to Registry (main only)') {

      when { branch 'main' }

      steps {

        withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {

          sh '''

            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

            docker tag ${IMAGE_NAME}:${SHORT_COMMIT} ${DOCKER_USER}/${IMAGE_NAME}:${SHORT_COMMIT}

            docker push ${DOCKER_USER}/${IMAGE_NAME}:${SHORT_COMMIT}

          '''

        }

      }

    }

  }

  post {

    success {

      script {

        if (env.ISSUE_KEY) {

          // Add comment to Jira

          jiraIssueSelector(issueSelector: [$class: 'ExplicitIssueSelector', issueKeys: [env.ISSUE_KEY]])

          jiraAddComment(issueKey: env.ISSUE_KEY, comment: "✅ Jenkins build succeeded: ${env.BUILD_URL}")

          // optionally transition the ticket (uncomment and set transition name if desired)

          // jiraTransitionIssue(issueKey: env.ISSUE_KEY, transition: "In Review")

        } else {

          echo "No JIRA issue key parsed from branch name (${env.BRANCH_NAME})"

        }

      }

    }

    failure {

      script {

        if (env.ISSUE_KEY) {

          jiraIssueSelector(issueSelector: [$class: 'ExplicitIssueSelector', issueKeys: [env.ISSUE_KEY]])

          jiraAddComment(issueKey: env.ISSUE_KEY, comment: "❌ Jenkins build failed: ${env.BUILD_URL}")

        } else {

          echo "No JIRA issue key parsed from branch name (${env.BRANCH_NAME})"

        }

      }

    }

  }

}
 

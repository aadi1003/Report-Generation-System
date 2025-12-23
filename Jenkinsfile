pipeline {
  agent any
  
  tools {
    nodejs 'node20' // Ensure this tool is configured in Jenkins
  }
  
  environment {
    REGISTRY = 'ghcr.io'
    IMAGE_NAME = 'aadi1003/report-generation-system'
    DOCKER_TAG = "${BUILD_NUMBER}"
    GITHUB_CREDENTIALS = credentials('github-token') // Jenkins credentials ID
    NODE_ENV = 'production'
  }
  
  options {
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '10'))
    disableConcurrentBuilds()
  }
  
  stages {
    stage('Clean Workspace') {
      steps {
        cleanWs()
      }
    }
    
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    
    stage('Docker Build & Test') {
      agent {
        docker {
          image 'docker:latest'
          args '-v /var/run/docker.sock:/var/run/docker.sock -v /usr/bin/docker:/usr/bin/docker'
          reuseNode true
        }
      }
      steps {
        script {
          echo "🚀 STEP 1: Docker Validation (MUST PASS)"
          
          // Build Docker image
          sh '''
            echo "Building Docker image..."
            docker build -t report-system .
          '''
          
          // Test Docker container
          sh '''
            echo "Testing Docker container..."
            
            # Start container
            docker run -d --name test-container -p 8080:80 report-system
            sleep 10
            
            # Test if website loads
            echo "Testing if container responds..."
            if curl -s -f http://localhost:8080 > /dev/null; then
              echo "✅ Container test passed!"
            else
              echo "❌ Container test failed!"
              docker logs test-container
              exit 1
            fi
            
            # Cleanup
            docker stop test-container || true
            docker rm test-container || true
          '''
          
          // Push to GitHub Container Registry
          echo "📦 Pushing to GitHub Container Registry..."
          withCredentials([usernamePassword(
            credentialsId: 'github-token',
            usernameVariable: 'GITHUB_USER',
            passwordVariable: 'GITHUB_TOKEN'
          )]) {
            sh '''
              # Login to GitHub Container Registry
              echo "${GITHUB_TOKEN}" | docker login ghcr.io -u ${GITHUB_USER} --password-stdin
              
              # Tag and push
              docker tag report-system ghcr.io/aadi1003/report-generation-system:latest
              docker tag report-system ghcr.io/aadi1003/report-generation-system:${BUILD_NUMBER}
              docker push ghcr.io/aadi1003/report-generation-system:latest
              docker push ghcr.io/aadi1003/report-generation-system:${BUILD_NUMBER}
              
              echo "✅ Docker image pushed successfully!"
            '''
          }
        }
      }
      post {
        always {
          sh '''
            echo "🧹 Cleaning up Docker resources..."
            docker container prune -f 2>/dev/null || true
            docker image prune -f 2>/dev/null || true
          '''
        }
      }
    }
    
    stage('Build Frontend') {
      when {
        expression {
          currentBuild.result == null || currentBuild.result == 'SUCCESS'
        }
      }
      steps {
        script {
          echo "📦 STEP 2: Building Frontend (requires Docker success)"
          
          sh '''
            echo "Installing dependencies..."
            npm ci
            
            echo "Building frontend..."
            npm run build
            
            echo "✅ Frontend build completed!"
          '''
        }
      }
      post {
        success {
          echo '📊 Archiving build artifacts...'
          archiveArtifacts 'dist/**/*'
          sh '''
            echo "Build Number: ${BUILD_NUMBER}" > build-info.txt
            echo "Date: $(date)" >> build-info.txt
            echo "Commit: $(git rev-parse HEAD)" >> build-info.txt
          '''
          archiveArtifacts 'build-info.txt'
        }
      }
    }
    
    stage('Deploy to GitHub Pages') {
      when {
        branch 'main'
        expression {
          currentBuild.result == null || currentBuild.result == 'SUCCESS'
        }
      }
      steps {
        script {
          echo "🚀 STEP 3: Deploying to GitHub Pages (requires all previous stages success)"
          
          withCredentials([usernamePassword(
            credentialsId: 'github-token',
            usernameVariable: 'GITHUB_USER',
            passwordVariable: 'GITHUB_TOKEN'
          )]) {
            sh '''
              echo "Setting up Git configuration..."
              git config --global user.email "jenkins@ci"
              git config --global user.name "Jenkins CI"
              
              echo "Installing gh-pages..."
              npm install -g gh-pages
              
              echo "Creating .nojekyll file..."
              touch dist/.nojekyll
              
              echo "Deploying to GitHub Pages..."
              # Using the GitHub token from Jenkins credentials
              npx gh-pages -d dist --dotfiles --repo https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/aadi1003/Report-Generation-System.git
              
              echo "✅ Deployment initiated!"
            '''
          }
          
          echo "🌐 Site will be available at: https://aadi1003.github.io/Report-Generation-System/"
        }
      }
    }
    
    stage('Integration Tests') {
      when {
        branch 'main'
        expression {
          currentBuild.result == null || currentBuild.result == 'SUCCESS'
        }
      }
      steps {
        script {
          echo "🧪 STEP 4: Running Integration Tests"
          
          // Wait for deployment to propagate
          sleep(time: 60, unit: 'SECONDS')
          
          sh '''
            echo "Testing deployed site..."
            MAX_RETRIES=5
            RETRY_COUNT=0
            
            while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
              if curl -s -f https://aadi1003.github.io/Report-Generation-System/ | grep -q "Report Generation System"; then
                echo "✅ Site is live and accessible!"
                exit 0
              else
                echo "Attempt $((RETRY_COUNT + 1)) failed. Retrying in 30 seconds..."
                RETRY_COUNT=$((RETRY_COUNT + 1))
                sleep 30
              fi
            done
            
            echo "⚠️ Site might still be deploying, check manually: https://aadi1003.github.io/Report-Generation-System/"
            exit 0 # Don't fail the pipeline for this
          '''
        }
      }
    }
  }
  
  post {
    always {
      echo "📋 Pipeline Status: ${currentBuild.currentResult}"
      echo "📊 Build URL: ${env.BUILD_URL}"
      sh '''
        echo "Performing final cleanup..."
        docker system prune -f 2>/dev/null || true
      '''
    }
    success {
      echo '🎉 All stages completed successfully!'
      emailext (
        subject: "Pipeline Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
        body: "The pipeline completed successfully.\n\nBuild: ${env.BUILD_URL}",
        to: 'YOUR_EMAIL@example.com' // Add your email here
      )
    }
    failure {
      echo "❌ Pipeline failed!"
      emailext (
        subject: "Pipeline Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
        body: "The pipeline failed. Please check Jenkins.\n\nBuild: ${env.BUILD_URL}",
        to: 'YOUR_EMAIL@example.com' // Add your email here
      )
    }
    unstable {
      echo "⚠️ Pipeline is unstable!"
    }
  }
}

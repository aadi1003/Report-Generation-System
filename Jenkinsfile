pipeline {
    agent any
    
    tools {
        nodejs 'node20'  // Configure in Jenkins → Tools → NodeJS
    }
    
    environment {
        // Docker registry settings
        REGISTRY = 'ghcr.io'
        IMAGE_NAME = 'aadi1003/report-generation-system'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        
        // GitHub credentials (use Jenkins credentials)
        GITHUB_CREDENTIALS = credentials('github-token')
        
        // For frontend build
        NODE_ENV = 'production'
    }
    
    stages {
        // STAGE 1: DOCKER VALIDATION (must pass before anything else)
        stage('Docker Build & Test') {
            steps {
                script {
                    echo "🚀 STEP 1: Docker Validation (MUST PASS)"
                    
                    // Checkout code
                    checkout scm
                    
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
                    sh '''
                        # Login to GitHub Container Registry
                        echo "$GITHUB_CREDENTIALS_PSW" | docker login ghcr.io -u aadi1003 --password-stdin
                        
                        # Tag and push
                        docker tag report-system ghcr.io/aadi1003/report-generation-system:latest
                        docker tag report-system ghcr.io/aadi1003/report-generation-system:${BUILD_NUMBER}
                        docker push ghcr.io/aadi1003/report-generation-system:latest
                        docker push ghcr.io/aadi1003/report-generation-system:${BUILD_NUMBER}
                        
                        echo "✅ Docker image pushed successfully!"
                    '''
                }
            }
            
            post {
                always {
                    echo "🧹 Cleaning up Docker resources..."
                    sh '''
                        docker container prune -f 2>/dev/null || true
                        docker image prune -f 2>/dev/null || true
                    '''
                }
            }
        }
        
        // STAGE 2: BUILD FRONTEND (only if Docker validation passes)
        stage('Build Frontend') {
            when {
                expression { 
                    // This stage only runs if previous stage succeeded
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
                    echo "📊 Archiving build artifacts..."
                    archiveArtifacts artifacts: 'dist/**/*'
                    
                    sh '''
                        echo "Build Number: ${BUILD_NUMBER}" > build-info.txt
                        echo "Date: $(date)" >> build-info.txt
                    '''
                    archiveArtifacts artifacts: 'build-info.txt'
                }
            }
        }
        
        // STAGE 3: DEPLOY TO GITHUB PAGES (only if both previous stages pass)
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
                        gh-pages -d dist --dotfiles --repo https://${GITHUB_CREDENTIALS_USR}:${GITHUB_CREDENTIALS_PSW}@github.com/aadi1003/Report-Generation-System.git
                        
                        echo "✅ Deployment initiated!"
                    '''
                    
                    echo "🌐 Site will be available at: https://aadi1003.github.io/Report-Generation-System/"
                }
            }
        }
        
        // STAGE 4: INTEGRATION TESTS (optional verification)
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
                        if curl -s -f https://aadi1003.github.io/Report-Generation-System/ | grep -q "Report Generation System"; then
                            echo "✅ Site is live and accessible!"
                        else
                            echo "⚠️ Site might still be deploying, check manually: https://aadi1003.github.io/Report-Generation-System/"
                        fi
                    '''
                }
            }
        }
    }
    
    // POST-BUILD ACTIONS
    post {
        always {
            echo "📋 Pipeline Status: ${currentBuild.currentResult}"
            echo "📊 Build URL: ${env.BUILD_URL}"
            
            // Final cleanup
            sh '''
                echo "Performing final cleanup..."
                docker system prune -f 2>/dev/null || true
            '''
        }
        
        success {
            echo "🎉 All stages completed successfully!"
            // Add notifications here (email, Slack, etc.)
        }
        
        failure {
            echo "❌ Pipeline failed at stage: ${env.STAGE_NAME}"
            // Add failure notifications here
        }
    }
    
    // PIPELINE OPTIONS
    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }
}

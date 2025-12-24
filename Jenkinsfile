// pipeline {
//     agent any
    
//     tools {
//         nodejs 'node20'  // Configure in Jenkins → Tools → NodeJS
//     }
    
//     environment {
//         // Docker registry settings
//         REGISTRY = 'ghcr.io'
//         IMAGE_NAME = 'aadi1003/report-generation-system'
//         DOCKER_TAG = "${env.BUILD_NUMBER}"
        
//         // GitHub credentials (use Jenkins credentials)
//         GITHUB_CREDENTIALS = credentials('github-token')
        
//         // For frontend build
//         NODE_ENV = 'production'
//     }
    
//     stages {
//         // STAGE 1: DOCKER VALIDATION (must pass before anything else)
//         stage('Docker Build & Test') {
//             steps {
//                 script {
//                     echo "🚀 STEP 1: Docker Validation (MUST PASS)"
                    
//                     // Checkout code
//                     checkout scm
                    
//                     // Build Docker image
//                     sh '''
//                         echo "Building Docker image..."
//                         docker build -t report-system .
//                     '''
                    
//                     // Test Docker container
//                     sh '''
//                         echo "Testing Docker container..."
                        
//                         # Start container
//                         docker run -d --name test-container -p 8080:80 report-system
//                         sleep 10
                        
//                         # Test if website loads
//                         echo "Testing if container responds..."
//                         if curl -s -f http://localhost:8080 > /dev/null; then
//                             echo "✅ Container test passed!"
//                         else
//                             echo "❌ Container test failed!"
//                             docker logs test-container
//                             exit 1
//                         fi
                        
//                         # Cleanup
//                         docker stop test-container || true
//                         docker rm test-container || true
//                     '''
                    
//                     // Push to GitHub Container Registry
//                     echo "📦 Pushing to GitHub Container Registry..."
//                     sh '''
//                         # Login to GitHub Container Registry
//                         echo "$GITHUB_CREDENTIALS_PSW" | docker login ghcr.io -u aadi1003 --password-stdin
                        
//                         # Tag and push
//                         docker tag report-system ghcr.io/aadi1003/report-generation-system:latest
//                         docker tag report-system ghcr.io/aadi1003/report-generation-system:${BUILD_NUMBER}
//                         docker push ghcr.io/aadi1003/report-generation-system:latest
//                         docker push ghcr.io/aadi1003/report-generation-system:${BUILD_NUMBER}
                        
//                         echo "✅ Docker image pushed successfully!"
//                     '''
//                 }
//             }
            
//             post {
//                 always {
//                     echo "🧹 Cleaning up Docker resources..."
//                     sh '''
//                         docker container prune -f 2>/dev/null || true
//                         docker image prune -f 2>/dev/null || true
//                     '''
//                 }
//             }
//         }
        
//         // STAGE 2: BUILD FRONTEND (only if Docker validation passes)
//         stage('Build Frontend') {
//             when {
//                 expression { 
//                     // This stage only runs if previous stage succeeded
//                     currentBuild.result == null || currentBuild.result == 'SUCCESS'
//                 }
//             }
            
//             steps {
//                 script {
//                     echo "📦 STEP 2: Building Frontend (requires Docker success)"
                    
//                     sh '''
//                         echo "Installing dependencies..."
//                         npm ci
                        
//                         echo "Building frontend..."
//                         npm run build
                        
//                         echo "✅ Frontend build completed!"
//                     '''
//                 }
//             }
            
//             post {
//                 success {
//                     echo "📊 Archiving build artifacts..."
//                     archiveArtifacts artifacts: 'dist/**/*'
                    
//                     sh '''
//                         echo "Build Number: ${BUILD_NUMBER}" > build-info.txt
//                         echo "Date: $(date)" >> build-info.txt
//                     '''
//                     archiveArtifacts artifacts: 'build-info.txt'
//                 }
//             }
//         }
        
//         // STAGE 3: DEPLOY TO GITHUB PAGES (only if both previous stages pass)
//         stage('Deploy to GitHub Pages') {
//             when {
//                 branch 'main'
//                 expression { 
//                     currentBuild.result == null || currentBuild.result == 'SUCCESS'
//                 }
//             }
            
//             steps {
//                 script {
//                     echo "🚀 STEP 3: Deploying to GitHub Pages (requires all previous stages success)"
                    
//                     sh '''
//                         echo "Setting up Git configuration..."
//                         git config --global user.email "jenkins@ci"
//                         git config --global user.name "Jenkins CI"
                        
//                         echo "Installing gh-pages..."
//                         npm install -g gh-pages
                        
//                         echo "Creating .nojekyll file..."
//                         touch dist/.nojekyll
                        
//                         echo "Deploying to GitHub Pages..."
//                         # Using the GitHub token from Jenkins credentials
//                         gh-pages -d dist --dotfiles --repo https://${GITHUB_CREDENTIALS_USR}:${GITHUB_CREDENTIALS_PSW}@github.com/aadi1003/Report-Generation-System.git
                        
//                         echo "✅ Deployment initiated!"
//                     '''
                    
//                     echo "🌐 Site will be available at: https://aadi1003.github.io/Report-Generation-System/"
//                 }
//             }
//         }
        
//         // STAGE 4: INTEGRATION TESTS (optional verification)
//         stage('Integration Tests') {
//             when {
//                 branch 'main'
//                 expression { 
//                     currentBuild.result == null || currentBuild.result == 'SUCCESS'
//                 }
//             }
            
//             steps {
//                 script {
//                     echo "🧪 STEP 4: Running Integration Tests"
                    
//                     // Wait for deployment to propagate
//                     sleep(time: 60, unit: 'SECONDS')
                    
//                     sh '''
//                         echo "Testing deployed site..."
//                         if curl -s -f https://aadi1003.github.io/Report-Generation-System/ | grep -q "Report Generation System"; then
//                             echo "✅ Site is live and accessible!"
//                         else
//                             echo "⚠️ Site might still be deploying, check manually: https://aadi1003.github.io/Report-Generation-System/"
//                         fi
//                     '''
//                 }
//             }
//         }
//     }
    
//     // POST-BUILD ACTIONS
//     post {
//         always {
//             echo "📋 Pipeline Status: ${currentBuild.currentResult}"
//             echo "📊 Build URL: ${env.BUILD_URL}"
            
//             // Final cleanup
//             sh '''
//                 echo "Performing final cleanup..."
//                 docker system prune -f 2>/dev/null || true
//             '''
//         }
        
//         success {
//             echo "🎉 All stages completed successfully!"
//             // Add notifications here (email, Slack, etc.)
//         }
        
//         failure {
//             echo "❌ Pipeline failed at stage: ${env.STAGE_NAME}"
//             // Add failure notifications here
//         }
//     }
    
//     // PIPELINE OPTIONS
//     options {
//         timeout(time: 30, unit: 'MINUTES')
//         buildDiscarder(logRotator(numToKeepStr: '10'))
//         disableConcurrentBuilds()
//     }
// }








pipeline {
    agent any  // Start with any agent
    
    environment {
        // Use Jenkins workspace path
        WORKSPACE = "${env.WORKSPACE}"
        DOCKER_IMAGE = "report-system-${env.BUILD_ID}"
    }
    
    stages {
        // STAGE 1: CHECKOUT
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        // STAGE 2: PREPARE DOCKER ENVIRONMENT
        stage('Prepare Docker') {
            steps {
                script {
                    echo "🛠️ Preparing Docker environment..."
                    
                    // Check if we have Docker
                    sh '''
                        echo "Checking Docker installation..."
                        which docker || echo "Docker not found in PATH"
                        docker --version || echo "Docker not working"
                    '''
                    
                    // Create Dockerfile if it doesn't exist
                    sh '''
                        if [ ! -f "Dockerfile" ]; then
                            echo "⚠️ Dockerfile not found, checking for dockerfile..."
                            if [ -f "dockerfile" ]; then
                                echo "Found lowercase dockerfile, renaming..."
                                cp dockerfile Dockerfile
                            fi
                        fi
                    '''
                }
            }
        }
        
        // STAGE 3: DOCKER BUILD (Simplified)
        stage('Build Docker Image') {
            steps {
                script {
                    echo "🐳 Building Docker image..."
                    
                    sh '''
                        # Show Dockerfile content for debugging
                        echo "=== DOCKERFILE CONTENT ==="
                        cat Dockerfile 2>/dev/null || echo "No Dockerfile found!"
                        echo "=========================="
                        echo ""
                        
                        # Build with explicit path and tag
                        echo "Building image..."
                        docker build -t ${DOCKER_IMAGE} .
                        
                        echo "✅ Image built successfully!"
                        docker images | grep ${DOCKER_IMAGE}
                    '''
                }
            }
        }
        
        // STAGE 4: DOCKER TEST
        stage('Test Docker Container') {
            steps {
                script {
                    echo "🧪 Testing Docker container..."
                    
                    sh '''
                        set +e  # Don't exit immediately on error
                        
                        echo "Starting container..."
                        # Run in background
                        docker run -d --name test-container-${BUILD_ID} -p 3000:80 ${DOCKER_IMAGE}
                        
                        # Wait for container to start
                        sleep 15
                        
                        echo "Checking container status..."
                        docker ps | grep test-container-${BUILD_ID}
                        
                        echo "Container logs:"
                        docker logs test-container-${BUILD_ID} --tail 20
                        
                        echo "Testing HTTP response..."
                        # Try multiple ports and methods
                        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "curl_failed")
                        
                        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "301" ]; then
                            echo "✅ Container test passed! HTTP code: $HTTP_CODE"
                            CONTAINER_TEST="PASS"
                        else
                            echo "⚠️ Container returned HTTP code: $HTTP_CODE"
                            echo "Trying alternative port 8080..."
                            
                            # Stop and restart on different port
                            docker stop test-container-${BUILD_ID} 2>/dev/null || true
                            docker rm test-container-${BUILD_ID} 2>/dev/null || true
                            
                            docker run -d --name test-container-${BUILD_ID} -p 8080:80 ${DOCKER_IMAGE}
                            sleep 10
                            
                            HTTP_CODE2=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 || echo "curl_failed")
                            
                            if [ "$HTTP_CODE2" = "200" ] || [ "$HTTP_CODE2" = "302" ] || [ "$HTTP_CODE2" = "301" ]; then
                                echo "✅ Container test passed on port 8080! HTTP code: $HTTP_CODE2"
                                CONTAINER_TEST="PASS"
                            else
                                echo "❌ Container test failed. Last HTTP code: $HTTP_CODE2"
                                echo "Container logs (last 50 lines):"
                                docker logs test-container-${BUILD_ID} --tail 50
                                CONTAINER_TEST="FAIL"
                            fi
                        fi
                        
                        # Cleanup
                        echo "Cleaning up test container..."
                        docker stop test-container-${BUILD_ID} 2>/dev/null || true
                        docker rm test-container-${BUILD_ID} 2>/dev/null || true
                        
                        if [ "$CONTAINER_TEST" = "FAIL" ]; then
                            exit 1
                        fi
                    '''
                }
            }
        }
        
        // Continue with other stages...
    }
}

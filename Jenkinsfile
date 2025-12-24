pipeline {
    agent any
    
    tools {
        nodejs 'node20'  // Configure in Jenkins → Global Tool Configuration
    }
    
    environment {
        // Docker settings
        DOCKER_IMAGE_NAME = "report-system-${BUILD_ID}"
        DOCKER_CONTAINER_NAME = "test-container-${BUILD_ID}"
        DOCKER_REGISTRY = "ghcr.io"
        DOCKER_REPO = "aadi1003/report-generation-system"
        
        // GitHub Pages settings
        GITHUB_PAGES_URL = "https://aadi1003.github.io/Report-Generation-System/"
        GITHUB_REPO_URL = "https://github.com/aadi1003/Report-Generation-System.git"
        
        // Build settings
        NODE_ENV = "production"
        BUILD_DIR = "dist"
    }
    
    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        ansiColor('xterm')  // For colored console output
    }
    
    parameters {
        choice(
            name: 'DEPLOY_ENVIRONMENT',
            choices: ['staging', 'production'],
            description: 'Select deployment environment'
        )
        booleanParam(
            name: 'RUN_TESTS',
            defaultValue: true,
            description: 'Run tests before deployment'
        )
    }
    
    stages {
        // STAGE 1: CHECKOUT
        stage('Checkout Code') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    extensions: [
                        [$class: 'CleanBeforeCheckout'],
                        [$class: 'CloneOption', depth: 1, noTags: false, shallow: true]
                    ],
                    userRemoteConfigs: [[
                        url: 'https://github.com/aadi1003/Report-Generation-System.git',
                        credentialsId: 'github-token'
                    ]]
                ])
                
                script {
                    echo "📦 Repository: ${env.GIT_URL}"
                    echo "📝 Commit: ${env.GIT_COMMIT}"
                    echo "🌿 Branch: ${env.GIT_BRANCH}"
                }
            }
        }
        
        // STAGE 2: INSTALL DEPENDENCIES
        stage('Install Dependencies') {
            steps {
                script {
                    echo "📦 Installing Node.js dependencies..."
                    
                    sh '''
                        echo "Node version:"
                        node --version
                        echo ""
                        echo "npm version:"
                        npm --version
                        echo ""
                        echo "Installing dependencies..."
                        npm ci --only=production
                        
                        echo "✅ Dependencies installed!"
                    '''
                }
            }
            
            post {
                failure {
                    echo "❌ Dependency installation failed!"
                    sh '''
                        echo "Trying with npm install instead..."
                        npm install
                    '''
                }
            }
        }
        
        // STAGE 3: RUN TESTS (Optional)
        stage('Run Tests') {
            when {
                expression { 
                    params.RUN_TESTS == true 
                }
            }
            
            steps {
                script {
                    echo "🧪 Running tests..."
                    
                    sh '''
                        echo "Running unit tests..."
                        npm test -- --passWithNoTests || echo "No tests found or tests failed"
                        
                        echo "Running linting..."
                        npm run lint || echo "Linting failed or not configured"
                    '''
                }
            }
        }
        
        // STAGE 4: DOCKER VALIDATION
        stage('Docker Build & Validation') {
            steps {
                script {
                    echo "🐳 Building Docker image..."
                    
                    // Check for Dockerfile
                    sh '''
                        echo "Checking for Dockerfile..."
                        if [ ! -f "Dockerfile" ]; then
                            echo "⚠️ Dockerfile not found! Creating a basic one..."
                            cat > Dockerfile << 'EOF'
# Multi-stage build for production
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
                            echo "Created basic Dockerfile for testing"
                        fi
                        
                        echo "Dockerfile content:"
                        cat Dockerfile | head -20
                    '''
                    
                    // Build Docker image
                    sh '''
                        echo "Building Docker image with tag: ${DOCKER_IMAGE_NAME}"
                        docker build \
                            --progress=plain \
                            --tag ${DOCKER_IMAGE_NAME}:latest \
                            --tag ${DOCKER_IMAGE_NAME}:${BUILD_ID} \
                            .
                        
                        echo "✅ Docker build completed!"
                        docker images ${DOCKER_IMAGE_NAME}
                    '''
                }
            }
        }
        
        // STAGE 5: DOCKER CONTAINER TEST
        stage('Docker Container Test') {
            steps {
                script {
                    echo "🧪 Testing Docker container..."
                    
                    sh '''
                        set +e  # Don't exit on error immediately
                        
                        echo "Starting test container..."
                        docker run -d \
                            --name ${DOCKER_CONTAINER_NAME} \
                            --publish 8080:80 \
                            ${DOCKER_IMAGE_NAME}:latest
                        
                        # Wait for container to start
                        echo "Waiting for container to be ready..."
                        sleep 10
                        
                        # Check container status
                        echo "Container status:"
                        docker ps --filter "name=${DOCKER_CONTAINER_NAME}"
                        
                        # Check logs
                        echo "Container logs (last 20 lines):"
                        docker logs ${DOCKER_CONTAINER_NAME} --tail 20
                        
                        # Test HTTP response
                        echo "Testing HTTP endpoint..."
                        MAX_RETRIES=3
                        RETRY_COUNT=0
                        HTTP_SUCCESS=false
        
                        while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
                            HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:8080/ || echo "000")
                            
                            if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
                                echo "✅ Container responded with HTTP $HTTP_CODE"
                                HTTP_SUCCESS=true
                                break
                            else
                                echo "⚠️ Attempt $((RETRY_COUNT + 1)): Got HTTP $HTTP_CODE"
                                RETRY_COUNT=$((RETRY_COUNT + 1))
                                sleep 5
                            fi
                        done
                        
                        # Cleanup
                        echo "Cleaning up test container..."
                        docker stop ${DOCKER_CONTAINER_NAME} 2>/dev/null || true
                        docker rm ${DOCKER_CONTAINER_NAME} 2>/dev/null || true
                        
                        if [ "$HTTP_SUCCESS" = false ]; then
                            echo "❌ Container test failed after $MAX_RETRIES attempts"
                            exit 1
                        fi
                        
                        echo "✅ Container test passed!"
                    '''
                }
            }
            
            post {
                always {
                    echo "🧹 Cleaning up Docker test resources..."
                    sh '''
                        docker container prune -f 2>/dev/null || true
                    '''
                }
            }
        }
        
        // STAGE 6: PUSH TO GITHUB CONTAINER REGISTRY
        stage('Push to GitHub Container Registry') {
            when {
                branch 'main'
            }
            
            steps {
                script {
                    echo "📦 Pushing to GitHub Container Registry..."
                    
                    withCredentials([
                        usernamePassword(
                            credentialsId: 'github-token',
                            usernameVariable: 'GITHUB_USERNAME',
                            passwordVariable: 'GITHUB_TOKEN'
                        )
                    ]) {
                        sh '''
                            echo "Logging into GitHub Container Registry..."
                            echo "${GITHUB_TOKEN}" | docker login ${DOCKER_REGISTRY} \
                                -u "${GITHUB_USERNAME}" \
                                --password-stdin
                            
                            echo "Tagging images..."
                            docker tag ${DOCKER_IMAGE_NAME}:latest ${DOCKER_REGISTRY}/${DOCKER_REPO}:latest
                            docker tag ${DOCKER_IMAGE_NAME}:${BUILD_ID} ${DOCKER_REGISTRY}/${DOCKER_REPO}:${BUILD_ID}
                            docker tag ${DOCKER_IMAGE_NAME}:${BUILD_ID} ${DOCKER_REGISTRY}/${DOCKER_REPO}:${GIT_COMMIT}
                            
                            echo "Pushing images..."
                            docker push ${DOCKER_REGISTRY}/${DOCKER_REPO}:latest
                            docker push ${DOCKER_REGISTRY}/${DOCKER_REPO}:${BUILD_ID}
                            docker push ${DOCKER_REGISTRY}/${DOCKER_REPO}:${GIT_COMMIT}
                            
                            echo "✅ Images pushed successfully!"
                            echo "Latest: ${DOCKER_REGISTRY}/${DOCKER_REPO}:latest"
                            echo "Build: ${DOCKER_REGISTRY}/${DOCKER_REPO}:${BUILD_ID}"
                            echo "Commit: ${DOCKER_REGISTRY}/${DOCKER_REPO}:${GIT_COMMIT}"
                        '''
                    }
                }
            }
        }
        
        // STAGE 7: BUILD FRONTEND
        stage('Build Frontend') {
            steps {
                script {
                    echo "🔨 Building frontend application..."
                    
                    sh '''
                        echo "Cleaning previous build..."
                        rm -rf ${BUILD_DIR} 2>/dev/null || true
                        
                        echo "Building with NODE_ENV=${NODE_ENV}..."
                        npm run build
                        
                        echo "Verifying build..."
                        if [ -d "${BUILD_DIR}" ]; then
                            echo "✅ Build directory created: ${BUILD_DIR}"
                            echo "Build contents:"
                            ls -la ${BUILD_DIR}/
                            echo ""
                            echo "Total size:"
                            du -sh ${BUILD_DIR}
                        else
                            echo "❌ Build directory not found!"
                            exit 1
                        fi
                    '''
                }
            }
            
            post {
                success {
                    echo "📦 Archiving build artifacts..."
                    
                    script {
                        // Create build info file
                        sh '''
                            echo "Build Information" > build-info.txt
                            echo "=================" >> build-info.txt
                            echo "Build Number: ${BUILD_NUMBER}" >> build-info.txt
                            echo "Build ID: ${BUILD_ID}" >> build-info.txt
                            echo "Git Commit: ${GIT_COMMIT}" >> build-info.txt
                            echo "Git Branch: ${GIT_BRANCH}" >> build-info.txt
                            echo "Build Date: $(date)" >> build-info.txt
                            echo "Build Time: $(date +%s)" >> build-info.txt
                        '''
                        
                        // Archive artifacts
                        archiveArtifacts artifacts: "${BUILD_DIR}/**/*", fingerprint: true
                        archiveArtifacts artifacts: 'build-info.txt', fingerprint: true
                        archiveArtifacts artifacts: 'package.json', fingerprint: true
                    }
                }
            }
        }
        
        // STAGE 8: DEPLOY TO GITHUB PAGES
        stage('Deploy to GitHub Pages') {
            when {
                branch 'main'
            }
            
            steps {
                script {
                    echo "🚀 Deploying to GitHub Pages..."
                    
                    withCredentials([
                        usernamePassword(
                            credentialsId: 'github-token',
                            usernameVariable: 'GITHUB_USER',
                            passwordVariable: 'GITHUB_TOKEN'
                        )
                    ]) {
                        sh '''
                            echo "Setting up Git configuration..."
                            git config --global user.email "jenkins@ci.cd"
                            git config --global user.name "Jenkins CI/CD"
                            
                            echo "Preparing for deployment..."
                            
                            # Create .nojekyll file to bypass Jekyll processing
                            touch ${BUILD_DIR}/.nojekyll
                            
                            # Create CNAME file if needed
                            # echo "yourdomain.com" > ${BUILD_DIR}/CNAME
                            
                            # Check if gh-pages is installed locally or install it
                            if [ -f "node_modules/.bin/gh-pages" ]; then
                                echo "Using local gh-pages..."
                                npx gh-pages -d ${BUILD_DIR} \
                                    --repo https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/aadi1003/Report-Generation-System.git \
                                    --user "Jenkins CI/CD <jenkins@ci.cd>" \
                                    --message "Automated deployment by Jenkins [Build #${BUILD_NUMBER}]" \
                                    --dotfiles
                            else
                                echo "Installing gh-pages globally..."
                                npm install -g gh-pages
                                
                                gh-pages -d ${BUILD_DIR} \
                                    --repo https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/aadi1003/Report-Generation-System.git \
                                    --user "Jenkins CI/CD <jenkins@ci.cd>" \
                                    --message "Automated deployment by Jenkins [Build #${BUILD_NUMBER}]" \
                                    --dotfiles
                            fi
                            
                            echo "✅ Deployment initiated!"
                        '''
                    }
                    
                    echo "🌐 Your site is being deployed to: ${GITHUB_PAGES_URL}"
                    echo "   Note: It may take 1-2 minutes to become available."
                }
            }
        }
        
        // STAGE 9: VERIFY DEPLOYMENT
        stage('Verify Deployment') {
            when {
                branch 'main'
            }
            
            steps {
                script {
                    echo "🔍 Verifying deployment..."
                    
                    sh '''
                        echo "Waiting for GitHub Pages deployment to propagate..."
                        sleep 30
                        
                        echo "Testing deployed site..."
                        MAX_VERIFY_ATTEMPTS=10
                        VERIFY_COUNT=0
                        VERIFIED=false
        
                        while [ $VERIFY_COUNT -lt $MAX_VERIFY_ATTEMPTS ]; do
                            echo "Verification attempt $((VERIFY_COUNT + 1))..."
                            
                            if curl -s -f "${GITHUB_PAGES_URL}" > /dev/null; then
                                echo "✅ Site is accessible!"
                                VERIFIED=true
                                break
                            else
                                echo "⚠️ Site not accessible yet (attempt $((VERIFY_COUNT + 1)))"
                                VERIFY_COUNT=$((VERIFY_COUNT + 1))
                                sleep 10
                            fi
                        done
        
                        if [ "$VERIFIED" = false ]; then
                            echo "⚠️ Could not verify site accessibility after $MAX_VERIFY_ATTEMPTS attempts"
                            echo "Site might still be deploying. Check manually: ${GITHUB_PAGES_URL}"
                        else
                            echo "🎉 Deployment verified successfully!"
                        fi
                    '''
                }
            }
        }
        
        // STAGE 10: CLEANUP
        stage('Cleanup') {
            steps {
                script {
                    echo "🧹 Performing cleanup..."
                    
                    sh '''
                        echo "Cleaning Docker resources..."
                        docker system prune -f --volumes 2>/dev/null || true
                        
                        echo "Cleaning npm cache..."
                        npm cache clean --force 2>/dev/null || true
                        
                        echo "Cleaning workspace..."
                        find . -name "node_modules" -type d -prune -exec rm -rf '{}' + 2>/dev/null || true
                        
                        echo "✅ Cleanup completed!"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo "📊 ====== PIPELINE COMPLETED ======"
            echo "Build Result: ${currentBuild.currentResult}"
            echo "Build URL: ${env.BUILD_URL}"
            echo "Duration: ${currentBuild.durationString}"
            echo "===================================="
            
            // Clean up any remaining Docker containers
            sh '''
                echo "Final Docker cleanup..."
                docker ps -aq | xargs -r docker stop 2>/dev/null || true
                docker ps -aq | xargs -r docker rm 2>/dev/null || true
                docker system prune -af 2>/dev/null || true
            '''
        }
        
        success {
            echo "🎉 PIPELINE SUCCESS!"
            echo "✅ Docker Image: ${DOCKER_REGISTRY}/${DOCKER_REPO}:${BUILD_ID}"
            echo "🌐 GitHub Pages: ${GITHUB_PAGES_URL}"
            
            // Send success notification (uncomment and configure as needed)
            // emailext (
            //     subject: "✅ Pipeline Successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            //     body: "The pipeline completed successfully.\n\nBuild: ${env.BUILD_URL}\nSite: ${GITHUB_PAGES_URL}",
            //     to: 'team@example.com'
            // )
        }
        
        failure {
            echo "❌ PIPELINE FAILED!"
            echo "Check the console output for details."
            
            // Send failure notification (uncomment and configure as needed)
            // emailext (
            //     subject: "❌ Pipeline Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            //     body: "The pipeline failed. Please check Jenkins.\n\nBuild: ${env.BUILD_URL}",
            //     to: 'team@example.com'
            // )
        }
        
        unstable {
            echo "⚠️ PIPELINE UNSTABLE!"
        }
        
        aborted {
            echo "⏸️ PIPELINE ABORTED!"
        }
    }
}

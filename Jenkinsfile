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
        
        // GitHub credentials (set in Jenkins → Credentials)
        GITHUB_TOKEN = credentials('github-token')
        
        // For frontend build
        NODE_ENV = 'production'
    }
    
    stages {
        // STAGE 1: Docker Validation
        stage('Docker Build & Test') {
            steps {
                script {
                    echo "🚀 Building Docker image..."
                    
                    // Build Docker image
                    sh '''
                        docker build -t report-system .
                    '''
                    
                    echo "🧪 Testing Docker container..."
                    
                    // Test container
                    sh '''
                        # Start container
                        docker run -d --name test-container -p 8080:80 report-system
                        sleep 10
                        
                        # Test if website loads
                        echo "Testing container..."
                        if curl -s -f http://localhost:8080 > /dev/null; then
                            echo "✅ Container test passed!"
                        else
                            echo "❌ Container test failed!"
                            docker logs test-container
                            exit 1
                        fi
                        
                        # Cleanup
                        docker stop test-container
                        docker rm test-container
                    '''
                    
                    echo "📦 Pushing to GitHub Container Registry..."
                    
                    // Login to GitHub Container Registry
                    withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                        sh '''
                            echo "$GITHUB_TOKEN" | docker login ghcr.io -u $GITHUB_ACTOR --password-stdin
                            docker tag report-system ghcr.io/aadi1003/report-generation-system:latest
                            docker tag report-system ghcr.io/aadi1003/report-generation-system:$BUILD_NUMBER
                            docker push ghcr.io/aadi1003/report-generation-system:latest
                            docker push ghcr.io/aadi1003/report-generation-system:$BUILD_NUMBER
                        '''
                    }
                }
            }
            
            post {
                always {
                    echo "🧹 Docker stage cleanup..."
                    sh '''
                        docker container prune -f || true
                        docker image prune -f || true
                    '''
                }
            }
        }
        
        // STAGE 2: Frontend Build
        stage('Build Frontend') {
            when {
                expression { 
                    // Only run if Docker stage succeeded
                    currentBuild.result == null || currentBuild.result == 'SUCCESS' 
                }
            }
            
            steps {
                script {
                    echo "📦 Installing dependencies..."
                    sh '''
                        npm ci
                    '''
                    
                    echo "🔨 Building frontend..."
                    sh '''
                        npm run build
                    '''
                    
                    echo "✅ Build completed!"
                }
            }
            
            post {
                success {
                    echo "📊 Archiving build artifacts..."
                    archiveArtifacts artifacts: 'dist/**/*'
                    
                    // Optional: Store build info
                    sh '''
                        echo "Build Number: $BUILD_NUMBER" > build-info.txt
                        echo "Commit: $GIT_COMMIT" >> build-info.txt
                        echo "Date: $(date)" >> build-info.txt
                    '''
                    archiveArtifacts artifacts: 'build-info.txt'
                }
            }
        }
        
        // STAGE 3: Deploy to GitHub Pages
        stage('Deploy to GitHub Pages') {
            when {
                branch 'main'
                expression { 
                    currentBuild.result == null || currentBuild.result == 'SUCCESS' 
                }
            }
            
            steps {
                script {
                    echo "🚀 Deploying to GitHub Pages..."
                    
                    withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                        sh '''
                            # Configure git
                            git config --global user.email "ci@jenkins"
                            git config --global user.name "Jenkins CI"
                            
                            # Deploy using gh-pages
                            npm install -g gh-pages
                            
                            # Create .nojekyll file for GitHub Pages
                            touch dist/.nojekyll
                            
                            # Deploy to gh-pages branch
                            gh-pages -d dist --dotfiles --repo https://$GITHUB_TOKEN@github.com/aadi1003/Report-Generation-System.git
                        '''
                    }
                    
                    echo "✅ Deployment initiated! Check: https://aadi1003.github.io/Report-Generation-System/"
                }
            }
        }
        
        // STAGE 4: Integration Tests (Optional)
        stage('Integration Tests') {
            when {
                branch 'main'
                expression { 
                    currentBuild.result == null || currentBuild.result == 'SUCCESS' 
                }
            }
            
            steps {
                script {
                    echo "🧪 Running integration tests..."
                    
                    // Wait for deployment to be ready
                    sleep(time: 30, unit: 'SECONDS')
                    
                    // Test the deployed site
                    sh '''
                        if curl -s -f https://aadi1003.github.io/Report-Generation-System/ | grep -q "Report Generation System"; then
                            echo "✅ Site is live and accessible!"
                        else
                            echo "❌ Site validation failed!"
                            exit 1
                        fi
                    '''
                }
            }
        }
    }
    
    // Post-build actions
    post {
        always {
            echo "📋 Pipeline completed with status: ${currentBuild.result}"
            
            // Clean Docker resources
            sh '''
                docker container prune -f 2>/dev/null || true
                docker image prune -f 2>/dev/null || true
            '''
        }
        
        success {
            echo "🎉 Pipeline succeeded!"
            
            // Send success notification (optional)
            emailext (
                subject: "✅ Pipeline SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Build ${env.BUILD_NUMBER} succeeded!",
                to: 'your-email@example.com'
            )
        }
        
        failure {
            echo "❌ Pipeline failed!"
            
            // Send failure notification (optional)
            emailext (
                subject: "❌ Pipeline FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Build ${env.BUILD_NUMBER} failed! Check: ${env.BUILD_URL}",
                to: 'your-email@example.com'
            )
        }
        
        unstable {
            echo "⚠️ Pipeline unstable!"
        }
    }
    
    // Pipeline options
    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        retry(1)
    }
    
    // Triggers
    triggers {
        // Poll SCM every 5 minutes
        pollSCM('*/5 * * * *')
        
        // OR GitHub webhook (preferred)
        // githubPush()
    }
}
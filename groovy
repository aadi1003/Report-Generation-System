pipeline {
    agent any
    
    tools {
        nodejs 'node20'  // Uses the Node.js tool you configured
    }
    
    stages {
        // Stage 1: Checkout code
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/aadi1003/Report-Generation-System.git',
                    credentialsId: 'github-token'
            }
        }
        
        // Stage 2: Backend setup
        stage('Backend Setup') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                }
            }
        }
        
        // Stage 3: Frontend setup  
        stage('Frontend Setup') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }
        
        // Stage 4: Run tests in parallel
        stage('Test') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm test'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm test'
                        }
                    }
                }
            }
        }
        
        // Stage 5: Build
        stage('Build') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm run build --if-present'
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline completed'
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed'
        }
    }
}
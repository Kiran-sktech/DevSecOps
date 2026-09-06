pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    bat 'npm ci'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Install Admin Dependencies') {
            steps {
                dir('admin') {
                    bat 'npm ci'
                }
            }
        }

        stage('Build Admin') {
            steps {
                dir('admin') {
                    bat 'npm run build'
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    bat 'npm ci'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                bat 'docker build -t forever-frontend:latest ./frontend'
                bat 'docker build -t forever-backend:latest ./backend'
                bat 'docker build -t forever-admin:latest ./admin'
            }
        }
    }

    post {

        success {
            echo 'CI Pipeline completed successfully! 🚀'
        }

        failure {
            echo 'CI Pipeline failed. Check the logs.'
        }

        always {
            echo 'Jenkins pipeline execution completed.'
        }
    }
}
pipeline {

    agent any

    environment {
        NODE_ENV = 'test'
        DOCKER_CONFIG = 'C:\\Users\\dolna\\.docker'
    }

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

        stage('Run Backend Tests') {
            steps {
                dir('backend') {
                    bat 'echo NODE_ENV=%NODE_ENV%'
                    bat 'npm test'
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

        stage('Push Docker Images') {
            steps {
                bat 'docker tag forever-frontend:latest bhumibuilds/forever-frontend:latest'
                bat 'docker tag forever-backend:latest bhumibuilds/forever-backend:latest'
                bat 'docker tag forever-admin:latest bhumibuilds/forever-admin:latest'

                bat 'docker push bhumibuilds/forever-frontend:latest'
                bat 'docker push bhumibuilds/forever-backend:latest'
                bat 'docker push bhumibuilds/forever-admin:latest'
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
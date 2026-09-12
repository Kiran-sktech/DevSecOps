pipeline {

    agent any

    environment {
        NODE_ENV = 'test'
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

        stage('Docker Hub Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-jenkins-push',
                    usernameVariable: 'DOCKERHUB_USERNAME',
                    passwordVariable: 'DOCKERHUB_PASSWORD'
                )]) {

                    bat 'powershell -NoProfile -Command "$env:DOCKERHUB_PASSWORD | docker login -u $env:DOCKERHUB_USERNAME --password-stdin"'
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
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-jenkins-push',
                    usernameVariable: 'DOCKERHUB_USERNAME',
                    passwordVariable: 'DOCKERHUB_PASSWORD'
                )]) {

                    bat 'docker tag forever-frontend:latest %DOCKERHUB_USERNAME%/forever-frontend:latest'
                    bat 'docker tag forever-backend:latest %DOCKERHUB_USERNAME%/forever-backend:latest'
                    bat 'docker tag forever-admin:latest %DOCKERHUB_USERNAME%/forever-admin:latest'

                    bat 'docker push %DOCKERHUB_USERNAME%/forever-frontend:latest'
                    bat 'docker push %DOCKERHUB_USERNAME%/forever-backend:latest'
                    bat 'docker push %DOCKERHUB_USERNAME%/forever-admin:latest'
                }
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
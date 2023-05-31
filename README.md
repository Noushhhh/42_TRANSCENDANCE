# 🌐 ft_transcendase 🌐

ft_transcendase is a project that utilizes 🐳 Docker and Docker Compose to manage multiple services including a backend, frontend, a database, and an nginx server. The project uses Docker to package the application and its dependencies into a standardized unit for software development and deployment, while Docker Compose is used to manage multi-container Docker applications.

## 📦 Docker Compose 📦

Docker Compose is used to define and run multi-container Docker applications. It uses YAML files to configure the application's services and allows the user to start all services with a single command.

Our `docker-compose.yml` file defines 4 services:

1. **Backend:** 📡 A Node.js server that serves our API.
2. **Frontend:** 🖥️ A React application for the client-side of our application.
3. **Database:** 🗄️ A PostgreSQL server for our data storage.
4. **Nginx:** 🌍 An Nginx server that serves our frontend and proxies our backend.

## 📁 File structure
[![Transcendance file structure](./assets/images/transcendance-file-structure.png "transcendance file structure")](http://www.plantuml.com/plantuml/png/fLJlJjim4F-UfpYnhv07w102oWP8Avf6fKr2q-GcbzRKiOtj5BffxxwpdIn9NRPE0wdAdN_tk_ztRXqphgb5bcMQ5MksH3YgtBUvOT8MA4ic2po27rdsC6DhhBZ0hy0iTCB0ofh2UYJGtqEfYZMQaqBLMbdCjxK8PbT1FOtQYCnHRiBRExd9WggFWnnqbE6lKg940wUd2u9GS6TdyEP2ElxKuESLT_XMS8cJQu-IdrGPn7n1ue0ZE8rnUFuJJnNyzxfBKetnCQG8pX-jai7YOzIcS6SB9Ik-xA7pLZF23KiNg0UvzcHCwvoCdL52eCcT3OGNMaz_A_SRrQfi10uCPa6n7spHR7WnHDz7JGgl6PSTRaRV8yJFBFdgsrOP2hdhco3oIz6qJVDV1_KhSEmqxBtNxUrOX2Sj6ngalOX6Uvl1POalH1V8RhsGPfzowcP1sVw1SELgqLFUa7HuKUMIonUgA9NqgM4rCrosDRrVRyTbVRMgmVUT9-frOso95Mk4yvDOzUWfIOFOug__pwHo20lbdAf1LNwv9_w7KsLhb0wy1_1ZpRZaSWauUDjG3cmXq5AI1jmAGHlrY8NBTsa76pZf18YRrXZck9BHKSVJtWtefdsNhrlJ2Sot6kyBmxNxTpwdD96DLtG2LrXH7opqkso9WpbOCLaI9vTqBNqf3D8ziyu2wKbmZP5Wq6ebBTg3NSTbxzrw6wEKWtWM2BMFvXYULsZebTvC2xN7mvYFGrZKa0qlVGgCq9pkkN5O9a746z97qRaPPHxZQAm7M11goOl3ilJ7Xpf5CAJmjg0LbovjK9fUU69Q2rx4fd8BD8QECy6_Onaoj8wbAGtFnq435o_UwnCN5pvD8YNv_omIj_xEHDV-fCFDVFRXxuvviGeYMdy5t6xSoko6jUkxlnmJcEwltDtrxTsNpbdPZivAFNlgwDoqisFJjSa1ikoSecvgyGi0) 



## 🛠️ Makefile 🛠️

The Makefile provides a simplified interface to manage Docker and Docker Compose commands.

Here is a brief description of the available commands:

- `make refresh`: 🔄 **I put this one in the first place beause it is the one we are going to use the most each time we integrate \
something in the app**, this command rebuild `frontend` and `nginx` container, also the volume they are sharing.
- `make up`: 🔼 Builds and starts the Docker Compose environment.
- `make build`: 🏗️ Builds the Docker Compose services.
- `make volumes`: 📁 Creates directories for volume data.
- `make check-docker`: ✅ Checks if Docker daemon is running.
- `make create`: 🆕 Creates the services without starting them.
- `make show_volumes`: 📋 Lists Docker volumes.
- `make start`: ▶️ Starts the Docker Compose environment.
- `make restart`: 🔄 Restarts the Docker Compose environment.
- `make ps`: 📝 Lists the running Docker Compose processes.
- `make images`: 🖼️ Lists the Docker images related to the Docker Compose environment.
- `make exec`: 💻 Executes an interactive bash shell on a running container.
- `make stop`: ⏹️ Stops the Docker Compose environment.
- `make down`: ⬇️ Stops and removes Docker Compose containers, networks, and volumes.
- `make logs`: 📜 Shows logs from Docker Compose environment.

## 📚 Prerequisites 📚

You need to have Docker and Docker Compose installed on your system to run the application. Please refer to the official Docker and Docker Compose documentation for installation instructions.

## 🚀 How to Use 🚀

1. Clone the repository: `git clone https://github.com/user/ft_transcendase.git`
2. Change to the directory: `cd ft_transcendase`
3. Build and start the Docker environment: `make up`

Once the environment is running, you can access the application at `localhost:80`.

## 👥 Contribution 👥

Please feel free to contribute to this project by opening Issues and submitting Pull Requests.

## 📝 License 📝

This project is licensed under [insert your License here] - see the LICENSE.md file for details.
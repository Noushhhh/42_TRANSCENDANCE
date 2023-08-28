# ./frontend/Dockerfile
# Set base image
FROM node:lts

RUN apt-get update -y
RUN apt-get upgrade -y

# Set working directory inside the Docker container
WORKDIR /app

# Install vim
RUN apt-get update && apt-get install -y vim

COPY package.json ./

COPY entrypoint.sh .

CMD chmod 777 entrypoint.sh

ENTRYPOINT [ "/bin/bash", "./entrypoint.sh" ]
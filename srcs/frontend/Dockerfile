# ./frontend/Dockerfile
# Set base image
FROM node:lts

RUN apt-get update -y
RUN apt-get upgrade -y

# Set working directory inside the Docker container
WORKDIR /app

# Install vim
RUN apt-get update && apt-get install -y vim

# Copy package.json and package-lock.json files to the Docker container's working directory
#COPY package*.json ./

COPY app/package.json ./

COPY entrypoint.sh .

CMD chmod 777 entrypoint.sh

ENTRYPOINT ["sh", "./entrypoint.sh"]
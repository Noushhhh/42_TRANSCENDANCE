# This line sets the base image for the Docker container. In this case, we're using the official Node.js image with the tag of 16, which is the version of Node.js.
FROM node:lts

RUN apt-get update -y
RUN apt-get upgrade -y

# This line tells Docker to listen on port 4000 at runtime. This is the port that your application will be available on.
EXPOSE 4000

# This line sets the working directory inside the Docker container. Any command that follows in the Dockerfile will be run in this directory.
WORKDIR /usr/src/app

# This line copies the package.json and package-lock.json (if available) files from your local directory to the Docker container's working directory.
COPY package*.json ./

# Copy prisma file in working directory
COPY /prisma /usr/src/app

COPY entrypoint.sh .

CMD chmod 777 entrypoint.sh

# Start the application
ENTRYPOINT ["sh", "./entrypoint.sh"]
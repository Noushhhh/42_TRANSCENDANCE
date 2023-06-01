# ./frontend/Dockerfile
# Set base image
FROM node:lts

# Set working directory inside the Docker container
WORKDIR /app

# Install vim
RUN apt-get update && apt-get install -y vim

# Copy package.json and package-lock.json files to the Docker container's working directory
#COPY package*.json ./

COPY app/package.json ./
# Run npm install to install all dependencies defined in the package.json file"
#CMD npm install
# Copy everything from the current directory to the Docker container's working directory

# Run npm run build to build the React application
COPY entrypoint.sh .
CMD chmod 777 entrypoint.sh
# Start the application
ENTRYPOINT ["sh", "./entrypoint.sh"]

#CMD ["tail", "-f", "/dev/random"]

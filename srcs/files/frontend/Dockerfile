# ./frontend/Dockerfile
# Set base image
FROM node:lts

# Set working directory inside the Docker container
WORKDIR /app  

# Install vim
RUN apt-get update && apt-get install -y vim

# Copy package.json and package-lock.json files to the Docker container's working directory
#COPY package*.json ./

COPY package.json ./
# Run npm install to install all dependencies defined in the package.json file"
RUN npm install

RUN npm install run

# Copy everything from the current directory to the Docker container's working directory

# Run npm run build to build the React application
# RUN npm run build

# Start the application
CMD ["npm", "run", "start"]

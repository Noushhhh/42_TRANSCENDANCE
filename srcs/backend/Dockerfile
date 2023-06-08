# This line sets the base image for the Docker container. In this case, we're using the official Node.js image with the tag of 16, which is the version of Node.js.
FROM node:lts

# This line sets the working directory inside the Docker container. Any command that follows in the Dockerfile will be run in this directory.
WORKDIR /usr/src/app 

# This line copies the package.json and package-lock.json (if available) files from your local directory to the Docker container's working directory.
COPY package*.json ./  

# This line tells Docker to listen on port 4000 at runtime. This is the port that your application will be available on.
EXPOSE 4000  

# # This line runs the npm install command which installs all the dependencies defined in the package.json file. 
# RUN npm install  

# # This line updates all the dependencies defined in the package.json file 
# RUN npm update  

# # This line copies everything from your current directory (on your local machine) to the Docker container's working directory.
# COPY . .  

# # This line runs the TypeScript compiler to build your application.
# RUN npm run prestart


# # This line provides the default command to run when the Docker container starts. In this case, it's starting the Node.js application.
# CMD [ "node", "dist/main" ]  

COPY entrypoint.sh .
CMD chmod 777 entrypoint.sh

# Start the application
ENTRYPOINT ["sh", "./entrypoint.sh"]

#!/bin/bash
# This line runs the npm install command which installs all the dependencies defined in the package.json file. 
npm install

# Install nodemon and ts-node as dev dependencies
npm install --save-dev nodemon ts-node

# This line updates all the dependencies defined in the package.json file 
npm update  

# This line runs the TypeScript compiler to build your application.
npm run prestart

# This line provides the default command to run when the Docker container starts. In this case, it's starting the Node.js application.
npm start

#!/bin/bash

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    #install latest version of npm
    echo "Installing latest version of npm"
    npm install -g npm@latest
    #install check for updates globally
    # echo "Installing npm-check-updates"
    # npm install -g npm-check-updates
    #update updates in the package.json file
    # echo "Updating packages version inside package.json"
    # ncu -u 
    #install all dependencies from package.json
    echo "Installing all dependencies from package.json"
    npm install
fi

echo "building the Node.js application"

npm run build 

npm install -g serve

serve -s build
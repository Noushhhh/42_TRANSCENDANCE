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
    npm install --save
fi

echo "Running prisma migrations"
npx prisma migrate deploy

#echo "Starting prisma studio"
#npx prisma studio &

echo "Starting the Node.js application"
npm run start:dev
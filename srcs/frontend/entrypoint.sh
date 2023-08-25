#!/bin/bash

echo "Installing all the dependencies from package.json"
if [ ! -d "node_modules" ]; then
    npm install
fi


echo "Starting the Node.js application"
npm run start
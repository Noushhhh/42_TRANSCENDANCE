#!/bin/bash

# This line runs the npm install command which installs all the dependencies defined in the package.json file.
echo "Installing all the dependencies from package.json"
if [ ! -d "node_modules" ]; then
    npm install
fi


# Install nodemon and ts-node as dev dependencies
echo "Installing nodemon and ts-node as dev dependencies"
npm install --save-dev nodemon ts-node

# This line updates all the dependencies defined in the package.json file 
echo "Updating all the dependencies from package.json"
npm update
# shouldnt update at each start can crash if versions not compatible  

echo "Running prisma migrations"
npx prisma migrate deploy

echo "Starting prisma studio"
npx prisma studio &

# Give permissions to use xdg open for prisma studio
echo "Giving permissions to xdg-open for Prisma Studio"
chmod +x /usr/src/app/node_modules/prisma/build/xdg-open

# This line provides the default command to run when the Docker container starts. In this case, it's starting the Node.js application.
echo "Starting the Node.js application"
npm run start:dev
#!/bin/bash

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing all the dependencies from package.json"
    npm install

    # Install nodemon and ts-node as dev dependencies
    echo "Installing nodemon and ts-node as dev dependencies"
    npm install --save-dev nodemon ts-node
fi

# echo "Updating all the dependencies from package.json"
# npm update 

echo "Running prisma migrations"
npx prisma migrate deploy

echo "Starting prisma studio"
npx prisma studio &

# Check if permissions are needed and then set them. This check can be made more specific based on your requirements.
if [ ! -x "/usr/src/app/node_modules/prisma/build/xdg-open" ]; then
    echo "Giving permissions to xdg-open for Prisma Studio"
    chmod +x /usr/src/app/node_modules/prisma/build/xdg-open
fi

echo "Starting the Node.js application"
npm run start:dev
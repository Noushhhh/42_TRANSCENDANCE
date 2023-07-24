#!/bin/bash
# This line runs the npm install command which installs all the dependencies defined in the package.json file. 
npm install

# Install nodemon and ts-node as dev dependencies
npm install --save-dev nodemon ts-node

# This line updates all the dependencies defined in the package.json file 
npm update
# shouldnt update at each start can crash if versions not compatible  

# This line runs the TypeScript compiler to build your application.
# npm run prestart
# doesnt exist 

# Generate database 
npx prisma generate

# Update database migration
npx prisma migrate dev

# Push to database last changes
npx prisma db push

# Give permissions to use xdg open for prisma studio
chmod +x /usr/src/app/node_modules/prisma/build/xdg-open

# This line provides the default command to run when the Docker container starts. In this case, it's starting the Node.js application.
npm start


# 🚀 Frontend Application 🚀

This is our frontend application built with React and TypeScript. The application uses styled-components for styling.

## 📦 Package.json 📦

The `package.json` file contains metadata about your application and its dependencies. Node.js uses this file to determine which packages to install for your application.

### Dependencies Explained 🧩

- **react:** This is the core package for the React library, which allows us to build user interfaces with components.

- **react-dom:** This package serves as the entry point of the DOM-related rendering paths. It is intended to be paired with the generic React package.

- **react-scripts:** This package includes scripts and configuration used by Create React App.

- **@types/node:** This package contains type definitions for Node.js. It's used in TypeScript projects to provide type checking and autocompletion for Node.js APIs.

- **@types/react and @types/react-dom:** These packages contain type definitions for React and ReactDOM. They're used in TypeScript projects to provide type checking and autocompletion for React APIs.

- **typescript:** TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It offers static type checking to catch errors before runtime.

- **styled-components:** This package allows us to write actual CSS code to style components. It also supports dynamic styling.

## 📚 File Structure 📚

Here's an overview of our main directories and files:

### 🐳 Dockerfile 🐳
This file contains the instructions for Docker to build your frontend application into a Docker image. This Docker image can then be run inside a Docker container.

### 🗂️ public/ 🗂️
This directory contains static files that your app can serve. This is where files like `index.html`, `favicon.ico`, and any static assets would live. The `index.html` file is the main HTML document that is served when someone visits your app. It typically contains a div element where your React app will render.

### 📂 src/ 📂
This directory is where you'll write all of your React code. This is where components, utilities, hooks, context providers, and everything else that makes up your React application will live.

This structure makes it clear where different types of files should be. For example, developers working on the project know to look in `src/` for React code and `public/` for static assets. Separating concerns in this way makes the project easier to navigate and maintain.

## 🚀 Getting Started 🚀

To get started with the project, run the following commands:

```bash
# Install dependencies
npm install

# Start the application
npm start

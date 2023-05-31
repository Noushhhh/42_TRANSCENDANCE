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
***

## 📚 File Structure 📚

**Here's an overview of our main directories and files:**

    frontend/
    ├── Dockerfile
    ├── public/                 # Contains static files to be served
    │   ├── index.html          # Main HTML document served on visiting the app
    │   └── favicon.ico         # Icon displayed in the browser tab
    └── src/                    # Contains React code
        ├── components/         # Contains React components
        ├── utilities/          # Contains utility functions
        ├── hooks/              # Contains React hooks
        └── contextProviders/   # Contains React context providers

* This file organization makes it clear where different types of files should be, making the project easier to navigate and maintain.

***
# 🔧 tsconfig.json

This `tsconfig.json` file is used to configure the TypeScript compiler options for a project. It specifies how TypeScript should compile your code and what rules it should follow. Let's go through each element in detail:
## Compiler Options

    🎯 "target": "es5": Specifies the ECMAScript version to which TypeScript should compile the code. In this case, it targets ECMAScript 5, which is widely supported by browsers and Node.js.

    📦 "module": "commonjs": Defines the module system used for code organization and reuse. CommonJS is a popular module format used in Node.js.

    🔄 "allowJs": true: Enables the compilation of JavaScript files alongside TypeScript files. This option allows you to gradually migrate a JavaScript project to TypeScript.

    ⚛️ "jsx": "react": Specifies the syntax for JSX (JavaScript XML) used in React applications. This option enables TypeScript to understand and validate JSX syntax.

    🗺️ "sourceMap": true: Generates source map files (*.map) during compilation. Source maps help with debugging by mapping the compiled JavaScript code back to the original TypeScript code.

    📁 "outDir": "./dist": Specifies the output directory for compiled files. In this case, the compiled JavaScript files will be placed in the ./dist directory.

    ✅ "strict": true: Enables strict type-checking and enforces stricter programming practices. It helps catch potential errors and maintain code quality.

    ♻️ "esModuleInterop": true: Allows interoperability between CommonJS and ECMAScript modules. This option simplifies the usage of modules in TypeScript.

    ❌ "skipLibCheck": true: Skips type checking of declaration files (*.d.ts). Declaration files are used to describe the types and interfaces of external JavaScript libraries.

    🔠 "forceConsistentCasingInFileNames": true: Ensures that file references and imports use consistent casing. This option prevents issues that may arise from different file systems with case sensitivity.

## Module Resolution Options

    🧩 "moduleResolution": "node": Defines how TypeScript resolves module import paths. node resolves modules using Node.js resolution algorithm.

    📄 "resolveJsonModule": true: Enables TypeScript to import JSON files as modules. It allows you to import and use JSON data within your TypeScript code.

## Experimental Options

    ✨ "experimentalDecorators": true: Enables support for the experimental decorator syntax. Decorators are a feature of TypeScript used to add metadata and behavior to classes, methods, properties, and parameters.

    🖼️ "emitDecoratorMetadata": true: Adds metadata reflection capabilities to decorators. With this option enabled, you can access the type information of decorated members at runtime.

## Include and Exclude

    📂 "include": ["src-front/**/*"]: Specifies the files or directories to include in the compilation process. In this case, it includes all files within the src-front directory and its subdirectories.

    🔒 "exclude": ["node_modules", "**/*.spec.ts"]: Defines the files or directories to exclude from the compilation. It excludes the node_modules directory and any files ending with .spec.ts. The node_modules folder typically contains external libraries, and test files ending with .spec.ts are excluded from the compilation.
***
## 📚 Vocabulary

* In this section, you'll find explanations for some of the key terms used throughout our React project:

`Decorators 📐`: In JavaScript (and TypeScript), decorators are special kinds of declarations that can be attached to classes, methods, and properties. They are a way to add both annotations and a meta-programming syntax for class declarations and members. Decorators provide a way to add both annotations and a meta-programming syntax for class declarations and members. For example, @Component decorator in Angular, or @observable in MobX.

`DOM-related rendering paths 🕸️`: In React, this term generally refers to the way React interacts with the Document Object Model (DOM) to update the browser's displayed webpage based on changes in component state or props. For example, when state changes in a component, React compares the new virtual DOM with the old one and updates only the parts of the real DOM that changed.

`React Components 🧩`: These are independent, reusable pieces of UI. They can be class-based or function-based. Each component is responsible for rendering a part of the app's UI. For example, a Navbar component might render the navigation bar at the top of the page.

`React Context Providers 🔄`: These are components that use React's Context API to provide data to all other components within them. This is often used to share global data like authentication status or theme preference. For example, a ThemeContext.Provider component might provide the current theme to all components in the app.

`React Hooks 🎣`: These are functions provided by React that let you use state and other React features in function components. For example, the useState hook lets you add state to a function component, and the useEffect hook lets you perform side effects in a function component.

`React and ReactDOM 🌐`: React is a JavaScript library for building user interfaces. ReactDOM is a complementary library that provides DOM-specific methods. For example, ReactDOM.render() is used to render a React component to a DOM node.

`**Utility functions 🔧**`: These are general-purpose functions that are not directly tied to the logic of the application or component. They can be used across different components for tasks like formatting dates, sorting arrays, etc. For example, a formatDate utility function might be used in multiple components to display dates in a specific format.
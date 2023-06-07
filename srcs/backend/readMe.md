# Backend

📦 Version: 1.0.0

## Description

This is the backend application for the project.

## Main File

- Main: `src/main.ts`

## Scripts

- Prestart: `tsc`
  - ✨ Utility: Executes the TypeScript compiler (tsc) before starting the application.
  
- Start: `nest start`
  - ✨ Utility: Starts the application using the NestJS framework's CLI command.

- Test: `echo "Error: no test specified" && exit 1`
  - ✨ Utility: Used for running tests. It echoes an error message and exits with an error code.

## Dependencies

- "@nestjs/cli": "^9.0.0"
  - ✨ Utility: NestJS CLI - Development tool for generating and managing NestJS applications.

- "@nestjs/common": "^9.0.0"
  - ✨ Utility: Provides common utilities and decorators used in NestJS applications.

- "@nestjs/core": "^9.0.0"
  - ✨ Utility: Core module of NestJS that provides the runtime engine and application context.

- "@nestjs/platform-express": "^9.0.0"
  - ✨ Utility: Integrates NestJS with Express, a popular web framework for Node.js.

- "@nestjs/typeorm": "^9.0.1"
  - ✨ Utility: NestJS integration with TypeORM, an Object-Relational Mapping (ORM) library for TypeScript and JavaScript.

- "typeorm": "^0.3.15"
  - ✨ Utility: Flexible and powerful ORM for TypeScript and JavaScript.

- "pg": "^8.11.0"
  - ✨ Utility: PostgreSQL client library for Node.js. Allows the application to connect to and interact with a PostgreSQL database.

- "reflect-metadata": "^0.1.13"
  - ✨ Utility: Provides a way to add and read metadata to/from TypeScript classes and their properties.

- "rxjs": "^7.8.1"
  - ✨ Utility: Reactive Extensions for JavaScript (RxJS) - Library for composing asynchronous and event-based programs.

- "serve-static": "^1.14.1"
  - ✨ Utility: Middleware for serving static files in Express applications.

***

# 🏗️ Structure

 Our project is structured in a feature-based fashion to make things as easy as possible. Here's what that means:  

plaintext

    backend/
    ├── Dockerfile-back
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── main.ts              # Entry point of our NestJS application.
        ├── app.module.ts        # Root module of the application.
        ├── app.service.ts
        ├── app.controller.ts
        ├── user/                # User feature module
        ├── auth/                # Auth feature module
        ├── products/            # Products feature module
        └── shared/              # Shared code module

**User Module 👥**: All things related to users, such as registration and profile editing.

**Auth Module 🔒**: Responsible for authentication, handling tasks such as login and JWT handling.

**Products Module 🛍️**: Responsible for the handling of product data, such as creating, updating and deleting products.

**Shared Module 🔄**: Contains reusable pieces of code that are used across multiple modules.

* Each feature has its own directory `(user, auth, products)`. This keeps all related files together and separate from unrelated files, which makes the codebase easier to understand and maintain.

* Each feature `module` has its own `.module.ts, .service.ts, .controller.ts`, and `.entity.ts` files. This adheres to the principles of NestJS's modular architecture.

* There's a `shared directory` for code that's used by multiple feature modules. This reduces duplication and makes it easier to update shared code.

***

# 📚 Vocabulary

* In this section, you'll find explanations for some of the key terms used throughout our project:

**Auth 🔒**: Auth stands for authentication and authorization. Authentication is the process of verifying who a user is, while authorization is the process of verifying what they have access to. For example, users might need to provide a username and password (authentication) to access their account page (authorization).

**Controller 🕹️**: In a NestJS application, a controller handles HTTP requests. It's like a traffic controller for incoming client requests and outgoing server responses. For example, a product controller might handle GET requests to view a product and POST requests to create a new product.

**CRUD 📝**: CRUD stands for Create, Read, Update, and Delete. These are the four basic operations that can be performed on any data. For example, in our application, users might be able to create a new account (Create), view their account details (Read), update their password (Update), and delete their account (Delete).

**JWT 🎟️**: JWT stands for JSON Web Token. This is a compact, URL-safe means of representing claims to be transferred between two parties. It's commonly used for authentication and information exchange. For example, once a user logs in, the server might return a JWT that the client can use to prove that they are logged in for subsequent requests.

**Module 📦**: In a NestJS application, a module is a class annotated with a @Module() decorator. A module brings together controllers, services, and other modules to organize the application structure. For example, our user module groups together everything related to users.

**Service 🛠️**: In a NestJS application, a service is a class that does something useful and can be injected as a dependency into controllers, other services, etc. For example, a userService might have methods to get a user by ID, create a new user, etc.
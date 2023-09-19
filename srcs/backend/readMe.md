# Backend 📦 
**Version:** 1.0.1

---

## Description

This is the backend application for the project.

---

## 🏗️ Structure

Here's an overview of our main directories and files:

![Backend file structure](../../assets/images/backendStructure.png)

---

## Features

- **JWT Authentication:** 
  - Secured routes with JWT (JSON Web Token) authentication.
  - Integrated with the built-in AuthGuard of NestJS.
  - Custom JwtGuard to handle both public and protected routes.

- **Public Decorator:** 
  - A custom decorator named @Public() to mark specific routes as publicly accessible. These routes bypass the usual JWT authentication.

- **Custom Guards:** 
  - Built a custom JWT guard extending the built-in AuthGuard to conditionally authenticate routes.
  - The custom guard uses the Reflector utility from NestJS to check for route metadata, determining if a route should be publicly accessible.

- **Error Handling:** 
  - Addressed TypeScript errors in the jwt.guard.ts related to asynchronous operations and type mismatches.

- **Incremental Compilation:** 
  - Utilized the TypeScript compiler in watch mode for efficient development, which incrementally compiles the code upon detecting changes.

---

## Tools and Technologies:

- **NestJS:** A progressive Node.js framework for building efficient and scalable server-side applications.
- **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
- **Docker:** A platform to develop, ship, and run applications inside containers.
- **Passport:** Express-compatible authentication middleware for Node.js.

---

## Recommendations for further learning:

- **NestJS Documentation:** Delve into official NestJS documentation, specifically exploring Guards, Dependency Injection, and Interceptors.
- **TypeScript Handbook:** The official TypeScript handbook is an excellent resource for understanding TypeScript's features.
- **rxjs:** Understand observables and reactive programming through the official rxjs documentation.

---

# 📚 Vocabulary

In this section, you'll find explanations for some of the key terms used throughout our project:

- **Auth 🔒:** Auth stands for authentication and authorization. Authentication is the process of verifying who a user is, while authorization is the process of verifying what they have access to.

- **Controller 🕹️:** In a NestJS application, a controller handles HTTP requests. It acts as a traffic controller for incoming client requests and outgoing server responses.

- **CRUD 📝:** CRUD stands for Create, Read, Update, and Delete. These are the four basic operations that can be performed on any data.

- **JWT 🎟️:** JWT stands for JSON Web Token. It's a compact, URL-safe means of representing claims to be transferred between two parties.

- **Module 📦:** In a NestJS application, a module is a class annotated with a @Module() decorator.

- **Service 🛠️:** In a NestJS application, a service is a class that performs specific tasks and can be injected as a dependency into various parts of the application.

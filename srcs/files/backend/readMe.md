# Backend

📦 Version: 1.0.0

## Description

This is the backend application for the project.

## Main File

- Main: `index.js`

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
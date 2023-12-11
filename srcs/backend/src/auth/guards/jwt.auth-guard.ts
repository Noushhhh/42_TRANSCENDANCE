// // // Importing necessary dependencies from the NestJS ecosystem.

// // // This guard is part of NestJS's integration with Passport, a popular authentication middleware for Node.js.
// import { AuthGuard } from '@nestjs/passport';       

// // // `ExecutionContext` provides a wrapper around the arguments which a route handler was called with.
// // // `Injectable` is a decorator that marks a class as injectable for NestJS's dependency injection system.
// import { ExecutionContext, Injectable } from '@nestjs/common'; 

// // // Reflector is a utility service from NestJS for retrieving metadata set using decorators within the framework.
// import { Reflector } from '@nestjs/core';           

// // // Importing the custom decorator we've defined to mark certain routes as publicly accessible without JWT authentication.
// import { IS_PUBLIC_KEY } from '../../decorators/public.decorators'; 

// // // Importing Observable from rxjs, a library for reactive programming using observables.
// // import { Observable } from 'rxjs';

// // // The `@Injectable()` decorator marks the class as a provider that can be managed 
// // // by the NestJS dependency injection system.
// @Injectable()
// export class JwtGuard extends AuthGuard('jwt') {

// //     // This constructor will be automatically called when an instance of JwtGuard is created.
// //     // `reflector` is a private property in this class that holds the instance of the `Reflector` utility service, 
// //     // which is injected by NestJS's dependency injection system.
//     constructor(private reflector: Reflector) {
//         super();  // Calling the constructor of the parent class (AuthGuard).
//     }

//     // `canActivate` is a required method for any guard in NestJS. It determines whether or not a particular request 
// //     // can continue to its route handler.
//     async canActivate(context: ExecutionContext): Promise<boolean> {

// //         console.log("can activate call");
// //         // Here, we're using the `reflector` to check if our route (or its containing controller) 
// //         // has the `IS_PUBLIC_KEY` metadata (i.e., if it's marked as public using the `@Public()` decorator).
//         const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
//             context.getHandler(),
//             context.getClass(),
//         ]);

// //         // If the route is marked as public, we simply allow the request to continue without authentication.
//         if (isPublic) {
//             return true;
//         }

// //         // If not public, we defer to the default behavior of the JWT authentication guard.
//         const result = super.canActivate(context);

// //         // If the result is an Observable (reactive programming construct), we convert it to a Promise.
// //         // This ensures that our function always returns a promise.
// //         /*if (result instanceof Observable) {
// //             // Convert the Observable to a Promise and ensure that if it emits `undefined`, we convert that to `false`.
// //             return result.toPromise().then(res => !!res);
// //         }*/

// //         // If the result is already a boolean, we return it as is.
//         return result as boolean;
//     }
// }


// import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import * as jwt from 'jsonwebtoken';

// @Injectable()
// export class JwtAuthGuard implements CanActivate {
//   constructor(private readonly JWT_SECRET: string) {}

//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const token = request.cookies.token;

//     try {
//       jwt.verify(token, this.JWT_SECRET);
//       return true;
//     } catch (error) {
//       return false;
//     }
//   }
// }

// jwt-auth.guard.ts
import { Injectable , ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable} from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    console.log('JwtAuthGuard activated');
    return super.canActivate(context);
  }
}

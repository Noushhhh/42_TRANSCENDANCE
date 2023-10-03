"use strict";
// // // Importing necessary dependencies from the NestJS ecosystem.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
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
const common_1 = require("@nestjs/common");
const jwt = __importStar(require("jsonwebtoken"));
let JwtAuthGuard = class JwtAuthGuard {
    constructor(JWT_SECRET) {
        this.JWT_SECRET = JWT_SECRET;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = request.cookies.token;
        try {
            jwt.verify(token, this.JWT_SECRET);
            return true;
        }
        catch (error) {
            return false;
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [String])
], JwtAuthGuard);

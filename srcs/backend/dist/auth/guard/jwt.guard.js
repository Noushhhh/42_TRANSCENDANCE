"use strict";
// Importing necessary dependencies from the NestJS ecosystem.
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtGuard = void 0;
// This guard is part of NestJS's integration with Passport, a popular authentication middleware for Node.js.
const passport_1 = require("@nestjs/passport");
// `ExecutionContext` provides a wrapper around the arguments which a route handler was called with.
// `Injectable` is a decorator that marks a class as injectable for NestJS's dependency injection system.
const common_1 = require("@nestjs/common");
// Reflector is a utility service from NestJS for retrieving metadata set using decorators within the framework.
const core_1 = require("@nestjs/core");
// Importing the custom decorator we've defined to mark certain routes as publicly accessible without JWT authentication.
const public_decorators_1 = require("../../decorators/public.decorators");
// Importing Observable from rxjs, a library for reactive programming using observables.
const rxjs_1 = require("rxjs");
// The `@Injectable()` decorator marks the class as a provider that can be managed 
// by the NestJS dependency injection system.
let JwtGuard = class JwtGuard extends (0, passport_1.AuthGuard)('jwt') {
    // This constructor will be automatically called when an instance of JwtGuard is created.
    // `reflector` is a private property in this class that holds the instance of the `Reflector` utility service, 
    // which is injected by NestJS's dependency injection system.
    constructor(reflector) {
        super(); // Calling the constructor of the parent class (AuthGuard).
        this.reflector = reflector;
    }
    // `canActivate` is a required method for any guard in NestJS. It determines whether or not a particular request 
    // can continue to its route handler.
    canActivate(context) {
        const _super = Object.create(null, {
            canActivate: { get: () => super.canActivate }
        });
        return __awaiter(this, void 0, void 0, function* () {
            // Here, we're using the `reflector` to check if our route (or its containing controller) 
            // has the `IS_PUBLIC_KEY` metadata (i.e., if it's marked as public using the `@Public()` decorator).
            const isPublic = this.reflector.getAllAndOverride(public_decorators_1.IS_PUBLIC_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            // If the route is marked as public, we simply allow the request to continue without authentication.
            if (isPublic) {
                return true;
            }
            // If not public, we defer to the default behavior of the JWT authentication guard.
            const result = _super.canActivate.call(this, context);
            // If the result is an Observable (reactive programming construct), we convert it to a Promise.
            // This ensures that our function always returns a promise.
            if (result instanceof rxjs_1.Observable) {
                // Convert the Observable to a Promise and ensure that if it emits `undefined`, we convert that to `false`.
                return result.toPromise().then(res => !!res);
            }
            // If the result is already a boolean, we return it as is.
            return result;
        });
    }
};
exports.JwtGuard = JwtGuard;
exports.JwtGuard = JwtGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], JwtGuard);

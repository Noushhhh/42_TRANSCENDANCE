"use strict";
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractJwt = void 0;
const common_1 = require("@nestjs/common");
const jwt = __importStar(require("jsonwebtoken"));
/**
* ****************************************************************************
 * ExtractJwt decorator is used to extract and decode JWT tokens from the request.
 * @function
 * @param {any} data - Unused data parameter. The `data` parameter is included in the function signature because
 *                     it is part of the expected function signature for custom decorators in NestJS. The
 *                     `createParamDecorator` function expects a callback function with two parameters: `data` and
 *                     `context`. In some other use cases, the `data` parameter might be used to pass additional
 *                     information to the decorator, but in this case, it is not needed.
 * @param {ExecutionContext} context - ExecutionContext instance.
 * @returns {DecodedPayload | null} - Returns the decoded JWT payload or null if the token is invalid or not found.
  * ****************************************************************************
  */
exports.ExtractJwt = (0, common_1.createParamDecorator)((data, context) => {
    // Get the JWT_SECRET from the environment variables
    const JWT_SECRET = process.env.JWT_SECRET;
    // Check if JWT_SECRET is set, otherwise throw an error
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable not set!');
    }
    // Get the request object from the ExecutionContext
    const request = context.switchToHttp().getRequest();
    // Get the cookies from the request object
    const cookies = request.cookies;
    // Get the access_token from the cookies
    const accessToken = cookies['token'];
    // If there's no access_token, return null
    if (!accessToken) {
        return null;
    }
    // Try to decode the access_token using the JWT_SECRET
    try {
        const decodedToken = jwt.verify(accessToken, JWT_SECRET);
        // If the token is successfully decoded, return the decoded token
        return decodedToken;
    }
    catch (error) {
        // If there's an error while decoding the token (e.g., the token is invalid),
        // return null
        return null;
    }
});

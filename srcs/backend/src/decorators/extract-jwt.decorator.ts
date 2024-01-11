// Import necessary modules and classes
import { createParamDecorator, ExecutionContext, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';


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

// Create a custom decorator named ExtractJwt
export const ExtractJwt = createParamDecorator((data, context: ExecutionContext) => {
  // Get the JWT secret from environment variables
  const JWT_SECRET = process.env.JWT_SECRET;

  // If the JWT secret is not set, throw an error
  if (!JWT_SECRET) {
    throw new UnauthorizedException('JWT_SECRET environment variable not set!');
  }

  // Get the HTTP request object from the execution context
  const request = context.switchToHttp().getRequest();

  // Get the cookies from the request
  const cookies = request.cookies;

  // Get the access token from the cookies
  const accessToken = cookies['token'];

  // If the access token is not found in the cookies, throw an UnauthorizedException
  // This results in a 401 Unauthorized HTTP response
  if (!accessToken) {
    throw new UnauthorizedException('Access token not found in cookies');
  }

  // Try to decode the access token using the JWT secret
  try {
    const decodedToken = jwt.verify(accessToken, JWT_SECRET);

    // If the token is successfully decoded, return the decoded token
    return decodedToken;
  } catch (error) {
    // If the token is invalid (i.e., it cannot be decoded), throw a BadRequestException
    // This results in a 400 Bad Request HTTP response
    throw new BadRequestException('Invalid access token');
  }
});

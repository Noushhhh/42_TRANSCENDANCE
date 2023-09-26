import { createParamDecorator, ExecutionContext } from '@nestjs/common';
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
export const ExtractJwt = createParamDecorator((data, context: ExecutionContext) => {
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
  } catch (error) {
    // If there's an error while decoding the token (e.g., the token is invalid),
    // return null
    return null;
  }
});

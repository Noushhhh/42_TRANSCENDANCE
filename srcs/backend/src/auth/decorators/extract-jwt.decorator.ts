// Import the necessary functions and libraries
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';


  

// Define the ExtractJwt decorator using the createParamDecorator function
export const ExtractJwt = createParamDecorator((data, context: ExecutionContext) => {
  // Get the JWT_SECRET from the environment variables
  const JWT_SECRET = process.env.JWT_SECRET;

  // Check if JWT_SECRET is set, otherwise throw an error
  // This ensures that the JWT_SECRET environment variable is properly set before using it
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
    console.log(decodedToken);
    return decodedToken;
  } catch (error) {
    // If there's an error while decoding the token (e.g., the token is invalid),
    // return null
    return null;
  }
});
// Import the `SetMetadata` function from '@nestjs/common'.
// This function is used to store custom metadata for route handling decorators.
import { SetMetadata } from '@nestjs/common';

// Define a constant for the custom metadata key.
// This will be used as an identifier to check if a route should be publicly accessible.
export const IS_PUBLIC_KEY = 'isPublic';

// Define a `Public` decorator function.
// Decorators are special functions in TypeScript that can be used to add metadata to classes, methods, and properties.
// This custom decorator will mark routes that should not require JWT authentication.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

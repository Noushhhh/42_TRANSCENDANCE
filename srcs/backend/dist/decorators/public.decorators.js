"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Public = exports.IS_PUBLIC_KEY = void 0;
// Import the `SetMetadata` function from '@nestjs/common'.
// This function is used to store custom metadata for route handling decorators.
const common_1 = require("@nestjs/common");
// Define a constant for the custom metadata key.
// This will be used as an identifier to check if a route should be publicly accessible.
exports.IS_PUBLIC_KEY = 'isPublic';
// Define a `Public` decorator function.
// Decorators are special functions in TypeScript that can be used to add metadata to classes, methods, and properties.
// This custom decorator will mark routes that should not require JWT authentication.
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;

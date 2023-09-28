"use strict";
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
// Importing required dependencies:
// 1. The DTO (Data Transfer Object) definition for authentication.
// 2. The validate function from the 'class-validator' library to validate the DTO instances.
const auth_dto_1 = require("./auth.dto");
const class_validator_1 = require("class-validator");
// Describes a group of related tests specifically for the 'AuthDto' class.
describe('AuthDto', () => {
    // This is an individual test case to check if a valid AuthDto can be created.
    it('should create a valid AuthDto', () => __awaiter(void 0, void 0, void 0, function* () {
        // Creating an instance of the AuthDto.
        const dto = new auth_dto_1.AuthDto();
        // Assigning a valid email and password to the AuthDto instance.
        dto.username = 'test@example.com';
        dto.password = 'password123';
        // The validate function from class-validator is used to check the 
        // validity of the AuthDto instance based on the decorators in the AuthDto definition.
        // For example, it checks if the 'username' is in a valid email format.
        const errors = yield (0, class_validator_1.validate)(dto);
        // This assertion checks if the validation errors array is empty.
        // An empty errors array means the DTO was valid as expected.
        expect(errors).toHaveLength(0);
    }));
    // This is an individual test case to check if an AuthDto with an invalid email is correctly identified.
    it('should fail for invalid email', () => __awaiter(void 0, void 0, void 0, function* () {
        // Creating another instance of the AuthDto.
        const dto = new auth_dto_1.AuthDto();
        // Assigning an invalid email format and a password to the AuthDto instance.
        dto.username = 'invalid-email';
        dto.password = 'password123';
        // Again, using the validate function to check the validity of the AuthDto instance.
        const errors = yield (0, class_validator_1.validate)(dto);
        // This assertion checks if the validation errors array has exactly one error.
        // As the username has an invalid email format, it should result in one error.
        expect(errors).toHaveLength(1);
        // This additional assertion checks if the property causing the error is 'username'.
        // This is to ensure the error is indeed due to the invalid email.
        expect(errors[0].property).toBe('username');
    }));
    // Further tests can be added to this describe block to test other scenarios.
});

// Importing required dependencies:
// 1. The DTO (Data Transfer Object) definition for authentication.
// 2. The validate function from the 'class-validator' library to validate the DTO instances.
import { CreateUserDto } from './create-user.dto';
import { validate } from 'class-validator';

// Describes a group of related tests specifically for the 'CreateUserDto' class.
describe('CreateUserDto', () => {

    // This is an individual test case to check if a valid CreateUserDto can be created.
    it('should create a valid CreateUserDto', async () => {

        // Creating an instance of the CreateUserDto.
        const dto = new CreateUserDto();

        // Assigning a valid email and hashPassword to the CreateUserDto instance.
        dto.username = 'test@example.com';
        dto.hashPassword = 'hashPassword123';

        // The validate function from class-validator is used to check the 
        // validity of the CreateUserDto instance based on the decorators in the CreateUserDto definition.
        // For example, it checks if the 'username' is in a valid email format.
        const errors = await validate(dto);
        
        // This assertion checks if the validation errors array is empty.
        // An empty errors array means the DTO was valid as expected.
        expect(errors).toHaveLength(0);
    });

    // This is an individual test case to check if an CreateUserDto with an invalid email is correctly identified.
    it('should fail for invalid email', async () => {

        // Creating another instance of the CreateUserDto.
        const dto = new CreateUserDto();

        // Assigning an invalid email format and a hashPassword to the CreateUserDto instance.
        dto.username = 'invalid-email';
        dto.hashPassword = 'hashPassword123';

        // Again, using the validate function to check the validity of the CreateUserDto instance.
        const errors = await validate(dto);
        
        // This assertion checks if the validation errors array has exactly one error.
        // As the username has an invalid email format, it should result in one error.
        expect(errors).toHaveLength(1);
        
        // This additional assertion checks if the property causing the error is 'username'.
        // This is to ensure the error is indeed due to the invalid email.
        expect(errors[0].property).toBe('username');
    });

    // Further tests can be added to this describe block to test other scenarios.
});

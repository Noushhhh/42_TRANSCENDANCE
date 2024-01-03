import { IsNotEmpty, IsString, registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

// This is a custom function that creates a special kind of check for passwords.
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    // This part tells our program to use a custom rule for validation.
    registerDecorator({
      name: 'isStrongPassword', // We name our custom rule 'isStrongPassword'.
      target: object.constructor, // This tells which object should use this rule.
      propertyName: propertyName, // This tells which property of the object we are checking.
      constraints: [], // We don't have any extra requirements for this rule.
      options: validationOptions, // These are options that can be set when the rule is used.
      validator: {
        // This is where we define how to check if the password is strong.
        async validate(value: any, args: ValidationArguments) {
          try {
            // We try to check the password with our validatePassword function.
            await validatePassword(value);
            return true; // If it passes, we say the password is good.
          } catch (error) {
            return false; // If it fails, we say the password is not good.
          }
        },
        // If the password is not good, we show this message.
        defaultMessage(args: ValidationArguments) {
          return 'Password does not meet complexity requirements.';
        },
      },
    });
  };
}

// ─────────────────────────────────────────────────────────────────────────────

// Custom decorator for email validation
export function IsEmailValid(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'isEmailValid',
        target: object.constructor,
        propertyName: propertyName,
        constraints: [],
        options: validationOptions,
        validator: {
          async validate(value: any, args: ValidationArguments) {
            try {
              await validateEmail(value);
              return true;
            } catch (error) {
              return false;
            }
          },
          defaultMessage(args: ValidationArguments) {
            return 'Email does not meet the required format.';
          },
        },
      });
    };
  }

// ─────────────────────────────────────────────────────────────────────────────




// This function checks if a password is strong enough.
export const validatePassword = async (password: string): Promise<any> => {
    // The password must be at least 8 characters long.
    if (password.length < 8) {
        throw new Error('Password should be at least 8 characters long.');
    }

    // The password must not exceed 30 characters characters long.
    if (password.length > 30) {
        throw new Error('Password must not exceed 30 characters characters long.');
    }
    // The password must have at least one lowercase letter.
    if (!/[a-z]/.test(password)) {
        throw new Error('Password should contain at least one lowercase letter.');
    }
    // The password must have at least one uppercase letter.
    if (!/[A-Z]/.test(password)) {
        throw new Error('Password should contain at least one uppercase letter.');
    }
    // The password must have at least one number.
    if (!/[0-9]/.test(password)) {
        throw new Error('Password should contain at least one digit.');
    }
    // The password must have at least one special character like @ or #.
    if (!/[@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password)) {
        throw new Error('Password should contain at least one special character (e.g., @, #, $, etc.).');
    }
};

// ─────────────────────────────────────────────────────────────────────────────

// Function to validate email
export const validateEmail = async (email: string): Promise<any> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address.');
    }
};

// ─────────────────────────────────────────────────────────────────────────────

// This is a class representing a user's login information.
export class AuthDto {
    // The username must be provided and it should be a string.
    @IsNotEmpty() @IsString()
    @IsEmailValid({ message: 'Invalid email address.' })
    @IsNotEmpty() @IsString() username!: string;

    // The password must be provided, it should be a string, and it must be strong.
    @IsNotEmpty() @IsString()
    @IsStrongPassword({
      message: "\nPassword Requirements:\n\
    1. Password should be at least 8 characters long.\n\
    2. Password must not exceed 30 characters long.\n\
    3. Password should contain at least one lowercase letter.\n\
    4. Password should contain at least one uppercase letter.\n\
    5. Password should contain at least one digit.\n\
    6. Password should contain at least one special character (e.g., @, #, $, etc.).\n"
    })
    password!: string;
}


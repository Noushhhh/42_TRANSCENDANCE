/* import {
	IsNotEmpty,
	IsString,
} from 'class-validator';

export class AuthDto {
    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsString()
    @IsNotEmpty()
    sword!: string;
// 
    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }
} */

// Importing validation decorators from 'class-validator' package
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

// The DTO (Data Transfer Object) for authentication operations
export class AuthDto {
    // Decorator to ensure that 'email' field cannot be empty
    @IsNotEmpty()
    username!: string;

    // Decorator to ensure that 'password' field is of type string
    @IsString()
    // Decorator to ensure that 'password' field cannot be empty
    @IsNotEmpty()
    password!: string;
}
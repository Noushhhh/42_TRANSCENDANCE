// Importing validation decorators from 'class-validator' package
import {    IsNotEmpty, 
            IsString, 
            IsUrl,
        } from "class-validator";

// The DTO (Data Transfer Object) for authentication operations

export class CreateUserDto {
        @IsNotEmpty() @IsString() username!: string;
        @IsNotEmpty() @IsString() hashPassword!: string;
        @IsNotEmpty() @IsUrl({ require_protocol: false }, { message: 'Invalid URL format' }) 
        avatar!: string;
}



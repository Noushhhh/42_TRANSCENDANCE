// Importing validation decorators from 'class-validator' package
import {
        IsNotEmpty,
        IsString,
        IsUrl,
        IsInt, Min
} from "class-validator";

import { Type } from "class-transformer";

// The DTO (Data Transfer Object) for authentication operations

export class CreateUserDto {
        @IsNotEmpty() @IsString() username!: string;
        @IsNotEmpty() @IsString() hashPassword!: string;
        @IsNotEmpty() @IsUrl({ require_protocol: false }, { message: 'Invalid URL format' })
        avatar!: string;
}

export class UserIdDto {
        @IsInt()
        @Min(0)
        @Type(() => Number)
        userId!: number;
}

export class friendRequestDto {
        @IsInt()
        @Type(() => Number)
        senderId!: number;

        @IsInt()
        @Type(() => Number)
        targetId!: number;
}

export class UpdatePublicNameDto {
        @IsString()
        @IsNotEmpty()
        publicName!: string;
}

export class TwoFADataDto {
        @IsInt()
        @Min(0)
        @Type(() => Number)
        userId!: number;

        @IsString()
        @IsNotEmpty()
        token!: string;
} 

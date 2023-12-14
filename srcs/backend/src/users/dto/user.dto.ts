// Importing validation decorators from 'class-validator' package
import {
        IsNotEmpty,
        IsString,
        IsUrl,
        IsInt,
        Min,
        Length,
        Matches,
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

export class friendDto {
        @IsInt()
        @Type(() => Number)
        id!: number;
}

export class UpdatePublicNameDto {
        @IsString()
        @IsNotEmpty()
        @IsString()
        @Length(2, 50)
        @Matches(/^[a-zA-Z0-9-_]+$/)
        publicName!: string;
}

export class TwoFADataDto {
        @IsString()
        @IsNotEmpty()
        token!: string;
}

export class TwoFaUserIdDto {
        @IsInt()
        @Min(0)
        @Type(() => Number)
        userId!: number;

        @IsString()
        @IsNotEmpty()
        token!: string;
}

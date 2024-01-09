// Importing validation decorators from 'class-validator' package
import {
        IsNotEmpty,
        IsString,
        IsUrl,
        IsInt,
        Min,
        Length,
        Matches,
        Max,
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
        @Max(2000000)
        @Type(() => Number)
        userId!: number;
}

export class friendRequestDto {
        @IsInt()
        @Type(() => Number)
        @Min(0)
        @Max(2000000)
        senderId!: number;

        @IsInt()
        @Type(() => Number)
        @Min(0)
        @Max(2000000)
        targetId!: number;
}

export class friendDto {
        @IsInt()
        @Type(() => Number)
        @Min(0)
        @Max(2000000)
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
        @Max(2000000)
        @Type(() => Number)
        userId!: number;

        @IsString()
        @IsNotEmpty()
        token!: string;
}

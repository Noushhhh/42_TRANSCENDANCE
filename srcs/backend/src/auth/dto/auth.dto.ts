import {
	IsNotEmpty,
	IsString,
    IsEmail,
    IsNumber,
    MaxLength,
    MinLength,
} from 'class-validator';


export class SignUpDto {
	@IsEmail()
	@IsNotEmpty()
	@MaxLength(50)
	email: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(32)
	password: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(32)
	username: string;
}

export class SignInDto {
	@IsString()
	@IsNotEmpty()
	password: string;

	@IsString()
	@IsNotEmpty()
	username: string;
}

// export class AuthDto {

//     @IsString()
//     @IsNotEmpty()
//     // @IsEmail()
//     @MaxLength(50)
//     email!: string;

//     @IsString()
//     @IsNotEmpty()
//     @MaxLength(32)
//     username!: string;

//     @IsString()
//     @IsNotEmpty()
//     @MaxLength(32)
//     password!: string;

//     // constructor(email: string, username: string, password: string) {
//     //     this.email = email;
//     //     this.username = username;
//     //     this.password = password;
//     // }
// }

export class Auth42Dto {
	@IsNumber()
	@IsNotEmpty()
	id: number;

	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	username: string;

	@IsString()
	@IsNotEmpty()
	avatar: string;
}

export class AuthTokenDto {
    @IsString()
    @IsNotEmpty()
    access_token: string;

    // @IsString()
    // @IsNotEmpty()
    // refresh_token: string;
}

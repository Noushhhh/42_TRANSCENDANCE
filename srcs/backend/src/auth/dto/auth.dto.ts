import {
	IsNotEmpty,
	IsString,
} from 'class-validator';

export class AuthDto {
    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }
}
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
    @IsString()
    @IsNotEmpty()
    login!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;

    constructor(login: string, password: string) {
        this.login = login;
        this.password = password;
    }
}
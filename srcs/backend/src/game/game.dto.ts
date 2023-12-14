import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

// Controller DTO
export class ConnectToLobbyDto {
    @IsString()
    @IsNotEmpty()
    clientId!: string;
}

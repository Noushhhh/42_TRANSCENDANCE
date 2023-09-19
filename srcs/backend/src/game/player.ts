import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { GameConfig, gameConfig } from "./data";

@Injectable()
export class Player {
    playerSocket: Socket | undefined;
    // playerGameConfig = new GameConfig();
}

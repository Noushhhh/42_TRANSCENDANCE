import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  ConnectedSocket,
  WsException,
  OnGatewayInit,
  OnGatewayConnection
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameLoopService } from './gameLoop.service';
import { GameLobbyService } from './gameLobby.service';
import { gameSockets } from './gameSockets';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { playerStatistics } from './playerStatistics.service';
import { AuthService } from '../auth/auth.service';
import { GatewayOut } from './gatewayOut';
import { UsersService } from '../users/users.service';

interface WebSocketResponse {
  success: boolean;
  message?: string;
}

type GameDataArray = [
  konvaHeight: number,
  konvaWidth: number,
  paddleHeight: number,
  paddleWidth: number,
]

interface PlayersId {
  user1: number;
  user2: number;
}

interface InvitationData {
  res: boolean;
  id: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GatewayIn implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly gameLoop: GameLoopService,
    private readonly gameLobby: GameLobbyService,
    private readonly gameSockets: gameSockets,
    private readonly playerStats: playerStatistics,
    private readonly authService: AuthService,
    private readonly gatewayOut: GatewayOut,
    private readonly userService: UsersService,
  ) { }

  afterInit() {
    this.server.use(async (socket, next) => {

      // check token validity return the userId if correspond to associated token
      // return null if token is invalid
      try {
        const response = await this.authService.checkOnlyTokenValidity(socket.handshake.auth.token);
        if (this.isUserAlreadyHasSocket(response!)) return;
        this.gameSockets.server = this.server;
        socket.data.userId = response;
        const clientId = socket.id;
        this.gameSockets.setSocket(clientId, socket);
        socket.setMaxListeners(15);
        this.gameSockets.printSocketMap();
        next();
      } catch (error) {
        next(new WsException('invalid token'));
      }
    })
  }

  isUserAlreadyHasSocket(userId: number) {
    const sockets = Array.from(this.server.sockets.sockets).map(socket => socket);
    for (const socket of sockets) {
      if (socket[1].data.userId === userId)
        return true;
    }
    return false;
  }

  printSockets() {
    const sockets = Array.from(this.server.sockets.sockets).map(socket => socket);
    console.log("Sockets: ");
    for (const socket of sockets) {
      console.log(socket[1].id);
    }
  }

  handleConnection(socket: Socket) {
    console.log(`userId ${socket.data.userId} is connected from game gateway`);
  }

  async handleDisconnect(client: Socket) {
    console.log("client " + client.id + " is disconnected from game gateway")
    await this.gameLobby.removePlayerFromLobby(client);
    this.gameSockets.removeSocket(client.id);
  }

  @SubscribeMessage('getPlayerPos')
  getPlayerPos(@MessageBody() direction: string, @ConnectedSocket() client: Socket) {
    this.gameLoop.updatePlayerPos(direction, client);
  }

  @SubscribeMessage('requestLobbies')
  requestLobbie(@ConnectedSocket() client: Socket) {
    this.gameLobby.sendLobbies(client);
  }

  @SubscribeMessage('setIntoLobby')
  setIntoLobby(@MessageBody() lobbyName: string, @ConnectedSocket() client: Socket) {
    this.gameLobby.addSpectatorToLobby(client.id, lobbyName);
  }

  @SubscribeMessage('sendPlayersPos')
  sendPlayersPos(@ConnectedSocket() client: Socket) {
    this.gameLobby.sendPlayersPos(client);
  }

  @SubscribeMessage('requestGameState')
  requestGameState(@ConnectedSocket() client: Socket) {
    this.gameLobby.sendLobbyGameState(client);
  }

  @SubscribeMessage('removeFromLobby')
  async removeFromLobby(@ConnectedSocket() client: Socket) {
    await this.gameLobby.removePlayerFromLobby(client);
  }

  @SubscribeMessage('resizeEvent')
  resizeEvent() {
    this.gameLoop.resizeEvent();
  }

  @SubscribeMessage('getColor')
  getColor(@ConnectedSocket() client: Socket, @MessageBody() color: string) {
    this.gameLobby.changePlayerColor(client, color);
  }

  @SubscribeMessage("launchGameWithFriend")
  async launchGameWithFriend(@ConnectedSocket() client: Socket, @MessageBody() playersId: PlayersId): Promise<WebSocketResponse> {
    const sockets = Array.from(this.server.sockets.sockets).map(socket => socket);
    let p1SocketId: string | null = null;
    let p2SocketId: string | null = null;
    console.log("sockets = ", sockets);
    for (const socket of sockets) {
      if (socket[1].data.userId === playersId.user1 || socket[1].data.userId === playersId.user2) {
        socket[1].data.userId === playersId.user1 ? p1SocketId = socket[0] : p2SocketId = socket[0];
      }
    }
    if (p1SocketId === null || p2SocketId === null) {
      //@to-do bien gerer erreur
      const response: WebSocketResponse = {
        success: false,
        message: 'Error trying to invite friend to game',
      };
      return response;
    }

    await this.gameLobby.launchGameWithFriend(playersId.user1, p1SocketId, playersId.user2, p2SocketId);
    const response: WebSocketResponse = {
      success: true,
      message: 'Game will be launched',
    };
    return response;
  }

  @SubscribeMessage("invitation")
  async invitation(@ConnectedSocket() client: Socket, @MessageBody() playersId: PlayersId): Promise<WebSocketResponse> {
    const sockets = Array.from(this.server.sockets.sockets).map(socket => socket);
    let p1SocketId: string | null = null;
    let p2SocketId: string | null = null;

    // @to-do gerer le cas de crash ici
    const p1 = await this.userService.findUserWithId(playersId.user1);
    if (!p1) {
      const response: WebSocketResponse = {
        success: false,
        message: 'Please try again',
      };
      return response;
    }

    const p1Name = p1.username;

    for (const socket of sockets) {
      if (socket[1].data.userId === playersId.user1 || socket[1].data.userId === playersId.user2) {
        socket[1].data.userId === playersId.user1 ? p1SocketId = socket[0] : p2SocketId = socket[0];
      }
    }

    if (!p2SocketId || !p1SocketId) {
      const response: WebSocketResponse = {
        success: false,
        message: 'Player is not connected',
      };
      return response;
    }

    const playerToInvite = this.gameSockets.getSocket(p2SocketId);

    if (!playerToInvite) {
      const response: WebSocketResponse = {
        success: false,
        message: 'Error trying to invite friend to game',
      };
      return response;
    };

    if (this.gameLobby.isInLobby(playerToInvite) === true) {
      this.gatewayOut.emitToUser(client.id, "invitationStatus", "player is already in a lobby");
      const response: WebSocketResponse = {
        success: true,
        message: 'Player is already in a lobby',
      };
      return response;
    }

    if (p1SocketId === null || p2SocketId === null) {
      //@to-do bien gerer erreur
      const response: WebSocketResponse = {
        success: false,
        message: 'Error trying to invite friend to game',
      };
      return response;
    }

    this.gatewayOut.emitToUser(p2SocketId, "invitation", { playerName: p1Name, playerSocketId: client.id });
    const response: WebSocketResponse = {
      success: true,
      message: 'Invitation accepted',
    };
    return response;
  }

  @SubscribeMessage('resToInvitation')
  resToInvitation(@ConnectedSocket() client: Socket, @MessageBody() res: InvitationData): WebSocketResponse {
    const playerToInvite = this.gameSockets.getSocket(res.id);
    if (!playerToInvite) {
      const response: WebSocketResponse = {
        success: false,
        message: 'Player not found',
      };
      return response;
    };

    this.gatewayOut.emitToUser(res.id, "isInviteAccepted", { res: res.res, client: client.data.userId });
    const response: WebSocketResponse = {
      success: true,
      message: 'Player has well answer the invitation',
    };
    return response;
  }

  @SubscribeMessage('printLobbies')
  printLobbies() {
    this.gameLobby.printLobbies();
  }

  @SubscribeMessage('requestLobbyState')
  requestLobbyState(@ConnectedSocket() client: Socket) {
    this.gameLobby.printLobbies();
    this.gameLobby.sendLobbyState(client);
  }

  @SubscribeMessage('requestUsersId')
  requestUsersId(@ConnectedSocket() client: Socket, @MessageBody() otherId: string): WebSocketResponse {
    // const clientId = 
    const sockets = Array.from(this.server.sockets.sockets).map(socket => socket);
    let clientId: number | null = null;
    let otherId_: number | null = null;

    for (const socket of sockets) {
      console.log(socket[0]);
      if (socket[0] === client.id || socket[0] === otherId) {
        socket[0] === client.id ? clientId = socket[1].data.userId : otherId_ = socket[1].data.userId;
      }
    }

    if (!clientId || !otherId_) {
      const response: WebSocketResponse = {
        success: false,
        message: 'Error trying to find user ID',
      };
      return response;
    };

    this.gatewayOut.emitToUser(client.id, "getUsersId", { callerId: clientId, targetId: otherId_ })
    const response: WebSocketResponse = {
      success: true,
      message: 'Users ID well found',
    };
    return response;
  }

  @SubscribeMessage('acceptReplay')
  acceptReplay(@ConnectedSocket() client: Socket) {
    const opponentId = this.gameLobby.getPlayerOpponentSocketId(client.id);
    const isP1 = this.gameLobby.isThisClientP1(client.id);

    if (opponentId) {
      if (isP1) {
        this.gatewayOut.emitToUser(opponentId, "player1Replay", true);
        this.gatewayOut.emitToUser(client.id, "player1Replay", true);
      } else {
        this.gatewayOut.emitToUser(opponentId, "player2Replay", true);
        this.gatewayOut.emitToUser(client.id, "player2Replay", true);
      }
    }
  }

  @SubscribeMessage('refuseReplay')
  async refuseReplay(@ConnectedSocket() client: Socket) {
    await this.gameLobby.removePlayerFromLobby(client);
  }

  @SubscribeMessage('isUserInGame')
  isUserInGame(@MessageBody() userId: number) {
    return this.gameLobby.isPlayerInGame(userId);
  }

  @SubscribeMessage('playAgain')
  playAgain(@ConnectedSocket() client: Socket) {
    this.gameLobby.playAgain(client.id);
  }

  @SubscribeMessage('setFalseIsLobbyFull')
  setFalseIsLobbyFull(@ConnectedSocket() client: Socket) {
    this.gatewayOut.emitToUser(client.id, "isLobbyFull", false);
  }

  private sendError(message: string, statusCode: number, client: Socket) {
    const errorObj = {
      message: message,
      statusCode: statusCode
    }
    this.gatewayOut.emitToUser(client.id, "error", errorObj);
  }
}

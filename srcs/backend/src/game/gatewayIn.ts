import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  ConnectedSocket,
  WsException,
  OnGatewayConnection
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameLoopService } from './gameLoop.service';
import { GameLobbyService } from './gameLobby.service';
import { gameSockets } from './gameSockets';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { GatewayOut } from './gatewayOut';
import { UsersService } from '../users/users.service';

interface WebSocketResponse {
  success: boolean;
  message?: string;
}

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
    private readonly authService: AuthService,
    private readonly gatewayOut: GatewayOut,
    private readonly userService: UsersService,
  ) { }

  afterInit() {
    this.server.use(async (socket, next) => {

      try {
        const response = await this.authService.checkOnlyTokenValidity(socket.handshake.auth.token);
        this.gameSockets.server = this.server;
        socket.data.userId = response;
        const clientId = socket.id;
        this.sendDecoToOtherSameUsers(response!, clientId);
        this.gameSockets.setSocket(clientId, socket);
        socket.setMaxListeners(15);
        next();
      } catch (error) {
        next(new WsException('invalid token'));
      }
    })
  }

  sendDecoToOtherSameUsers(userId: number, socketId: string) {
    const sockets = Array.from(this.server.sockets.sockets).map(socket => socket);

    for (const socket of sockets) {
      if (socket[0] === socketId) return;
      if (socket[1].data.userId === userId) {
        this.gatewayOut.emitToUser(socket[0], "disconnectUser", true);
      }
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
    if (typeof direction !== 'string') {
      this.gatewayOut.socketError(client.id, "Error trying to send player position");
      return;
    }

    this.gameLoop.updatePlayerPos(direction, client);
  }

  @SubscribeMessage('requestLobbies')
  requestLobbie(@ConnectedSocket() client: Socket) {
    this.gameLobby.sendLobbies(client);
  }

  @SubscribeMessage('setIntoLobby')
  setIntoLobby(@MessageBody() lobbyName: string, @ConnectedSocket() client: Socket) {
    if (typeof lobbyName !== 'string') {
      this.gatewayOut.socketError(client.id, "Error trying to get lobby name");
      return;
    }

    const res = this.gameLobby.addSpectatorToLobby(client.id, lobbyName);
    if (res === -1) {
      this.gatewayOut.socketError(client.id, "Error trying to join spectate mode");
    }
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
    const res = await this.gameLobby.removePlayerFromLobby(client);

    if (res === -1) {
      this.gatewayOut.socketError(client.id, "Error trying to remove player from lobby");
    }
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
    if (typeof playersId.user1 !== 'number' || typeof playersId.user2 !== 'number') {
      this.gatewayOut.socketError(client.id, "Error trying to launch game with friend");
      const response: WebSocketResponse = {
        success: false,
        message: 'Error trying to launch game with friend',
      };
      return response;
    }

    const sockets = Array.from(this.server.sockets.sockets).map(socket => socket);
    let p1SocketId: string | null = null;
    let p2SocketId: string | null = null;

    for (const socket of sockets) {
      if (socket[1].data.userId === playersId.user1 || socket[1].data.userId === playersId.user2) {
        socket[1].data.userId === playersId.user1 ? p1SocketId = socket[0] : p2SocketId = socket[0];
      }
    }

    if (p1SocketId === null || p2SocketId === null) {
      const response: WebSocketResponse = {
        success: false,
        message: 'Error trying to invite friend to game',
      };
      this.gatewayOut.socketError(client.id, "Error trying to invite friend to game");
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
    if (typeof playersId.user1 !== 'number' || typeof playersId.user2 !== 'number') {
      this.gatewayOut.socketError(client.id, "Error trying to invite friend");
      const response: WebSocketResponse = {
        success: false,
        message: 'Error trying to invite friend',
      };
      return response;
    }

    const sockets = Array.from(this.server.sockets.sockets).map(socket => socket);
    let p1SocketId: string | null = null;
    let p2SocketId: string | null = null;

    const p1 = await this.userService.findUserWithId(playersId.user1);
    if (!p1) {
      const response: WebSocketResponse = {
        success: false,
        message: 'Please try again',
      };
      return response;
    }

    const p1Name = p1.publicName;

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

    if (this.gameLobby.isInLobby(playerToInvite) === true
      || this.gameLobby.isInSpectateMode(playerToInvite.id) === true) {
      this.gatewayOut.emitToUser(client.id, "invitationStatus", "player is already in a lobby");
      const response: WebSocketResponse = {
        success: true,
        message: 'Player is already in a lobby',
      };
      return response;
    }

    if (p1SocketId === null || p2SocketId === null) {
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
    if (typeof res.id !== 'string' || typeof res.res !== 'boolean') {
      const response: WebSocketResponse = {
        success: false,
        message: 'Error trying to res to invitation',
      };
      return response;
    }

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

  @SubscribeMessage('requestLobbyState')
  requestLobbyState(@ConnectedSocket() client: Socket) {
    this.gameLobby.sendLobbyState(client);
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
    } else if (opponentId === undefined) {
      this.gatewayOut.socketError(client.id, "Player not found");
    }
  }

  @SubscribeMessage('refuseReplay')
  async refuseReplay(@ConnectedSocket() client: Socket) {
    const res = await this.gameLobby.removePlayerFromLobby(client);

    if (res === -1) {
      this.gatewayOut.socketError(client.id, "Error trying to remove player from lobby");
    }
  }

  @SubscribeMessage('isUserInGame')
  isUserInGame(@ConnectedSocket() client: Socket, @MessageBody() userId: number) {
    if (typeof userId !== 'number') {
      this.gatewayOut.socketError(client.id, "Socket error type");
      return;
    }
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

  @SubscribeMessage('isInSpectateMode')
  isInSpectateMode(@ConnectedSocket() client: Socket) {
    this.gameLobby.isInSpectateMode(client.id);
  }

  @SubscribeMessage('leaveSpecateMode')
  leaveSpecateMode(@ConnectedSocket() client: Socket) {
    this.gameLobby.removeFromSpectate(client.id);
  }

  @SubscribeMessage("relaunchTimer")
  relaunchTimer(@ConnectedSocket() client: Socket) {
    this.gatewayOut.emitToUser(client.id, "relaunchGame", true);
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const config_1 = require("@nestjs/config");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const bookmark_module_1 = require("./bookmark/bookmark.module");
const SocketModule_1 = require("./socket/SocketModule");
// import { PrismaModule } from './prisma/prisma.module';
const chat_controller_1 = require("./chat/chat.controller");
const chat_service_1 = require("./chat/chat.service");
const prisma_module_1 = require("./prisma/prisma.module");
const prisma_service_1 = require("./prisma/prisma.service");
const chat_module_1 = require("./chat/chat.module");
const game_module_1 = require("./game/game.module");
const SocketEvents_1 = require("./socket/SocketEvents");
const socket_service_1 = require("./socket/socket.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            bookmark_module_1.BookmarkModule,
            config_1.ConfigModule.forRoot({}),
            SocketModule_1.SocketModule,
            chat_module_1.ChatModule,
            prisma_module_1.PrismaModule,
            game_module_1.GameModule,
        ],
        controllers: [app_controller_1.AppController, chat_controller_1.ChatController],
        providers: [app_service_1.AppService, chat_service_1.ChatService, prisma_service_1.PrismaService, SocketEvents_1.SocketEvents, socket_service_1.SocketService],
    })
], AppModule);

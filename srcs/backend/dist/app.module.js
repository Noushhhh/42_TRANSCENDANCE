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
// import { ConfigModule } from '@nestjs/config';
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const bookmark_module_1 = require("./bookmark/bookmark.module");
const SocketModule_1 = require("./socket/SocketModule");
// import { PrismaModule } from './prisma/prisma.module';
let AppModule = exports.AppModule = class AppModule {
};
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        // 14/06/2023 pmulin => Pour se connecter a la bdd,
        // decommenter l'import du TYPEOrm,
        // Je l'ai commente car il ne fonctionnait pas. a debugger
        imports: [
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            bookmark_module_1.BookmarkModule,
            SocketModule_1.SocketModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);

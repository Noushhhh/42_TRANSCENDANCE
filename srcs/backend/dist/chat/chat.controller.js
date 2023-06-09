"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
require("./interfaces/chat.interface");
let ChatController = exports.ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    ;
    getAllConvFromId(id) {
        return this.chatService.getAllConvFromId(id);
    }
    addChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.chatService.addChannel();
        });
    }
    addMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.chatService.addMessage();
        });
    }
    getLastMessage(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.getLastMessage(id);
        });
    }
    getChannelHeadersFromUserId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.getChannelHeadersFromId(id);
        });
    }
    getAllMessagesByChannelId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const messages = this.chatService.getAllMessagesByChannelId(id);
                return messages;
            }
            catch (error) {
                throw new common_1.HttpException('Cannot find channel', common_1.HttpStatus.NOT_FOUND);
            }
        });
    }
    addMessageToChannelId(id, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.chatService.addMessageToChannelId(id, message);
            }
            catch (error) {
                throw new common_1.HttpException('Cannot find channel', common_1.HttpStatus.NOT_FOUND);
            }
        });
    }
    getUsersFromChannelId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.getUsersFromChannelId(id);
        });
    }
    getLoginsFromSubstring(substring) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.getLoginsFromSubstring(substring);
        });
    }
    addChannelToUser(channelInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("addChannelToUser called");
            try {
                return this.chatService.addChannelToUser(channelInfo);
            }
            catch (error) {
                throw new common_1.HttpException('Cannot find channel', common_1.HttpStatus.NOT_FOUND);
            }
        });
    }
};
__decorate([
    (0, common_1.Get)('getAllConvFromId/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "getAllConvFromId", null);
__decorate([
    (0, common_1.Post)('addChannel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addChannel", null);
__decorate([
    (0, common_1.Post)('addMessage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addMessage", null);
__decorate([
    (0, common_1.Get)('getLastMsg/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getLastMessage", null);
__decorate([
    (0, common_1.Get)('getChannelHeader/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChannelHeadersFromUserId", null);
__decorate([
    (0, common_1.Get)('getAllMessagesByChannelId/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getAllMessagesByChannelId", null);
__decorate([
    (0, common_1.Post)('addMessageToChannel/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addMessageToChannelId", null);
__decorate([
    (0, common_1.Get)('getUsersFromChannelId/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUsersFromChannelId", null);
__decorate([
    (0, common_1.Get)('getLoginsFromSubstring/:substring'),
    __param(0, (0, common_1.Param)('substring')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getLoginsFromSubstring", null);
__decorate([
    (0, common_1.Post)('addChannelToUser'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addChannelToUser", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);

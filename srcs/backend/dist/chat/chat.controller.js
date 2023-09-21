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
const chat_dto_1 = require("./dto/chat.dto");
const chat_service_1 = require("./chat.service");
require("./interfaces/chat.interface");
const admin_guards_1 = require("./guards/admin.guards");
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    ;
    getAllConvFromId(userIdDto) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("get all conv called");
            return this.chatService.getAllConvFromId(userIdDto.userId);
        });
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
    getLoginsInChannelFromSubstring(substring, channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.getLoginsInChannelFromSubstring(channelId, substring);
        });
    }
    getLoginsFromSubstring(substring) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.getLoginsFromSubstring(substring);
        });
    }
    addChannelToUser(channelInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.chatService.addChannelToUser(channelInfo);
            }
            catch (error) {
                throw new common_1.HttpException('Cannot find channel', common_1.HttpStatus.NOT_FOUND);
            }
        });
    }
    isAdmin(userId, channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.isAdmin(userId, channelId);
        });
    }
    kickUserFromChannel(userId, channelId, callerId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("kick user called");
            return this.chatService.kickUserFromChannel(userId, channelId, callerId);
        });
    }
    banUserFromChannel(userId, channelId, callerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.banUserFromChannel(userId, channelId, callerId);
        });
    }
    leaveChannel(userId, channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.leaveChannel(userId, channelId);
        });
    }
    getNumberUsersInChannel(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.getNumberUsersInChannel(channelId);
        });
    }
    getAdmins(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.getAdmins(channelId);
        });
    }
    isUserIsInChannel(userId, channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.isUserIsInChannel(userId, channelId);
        });
    }
    addAdminToChannel(inviterId, invitedId, channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.addAdminToChannel(inviterId, invitedId, channelId);
        });
    }
    removeAdminFromChannel(inviterId, invitedId, channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.removeAdminFromChannel(inviterId, invitedId, channelId);
        });
    }
    addUserToChannel(userId, channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.addUserToChannel(userId, channelId);
        });
    }
    addUserToProtectedChannel(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.addUserToProtectedChannel(data.channelId, data.password, data.userId);
        });
    }
    isChannelNameExist(channelNameDto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.isChannelNameExist(channelNameDto.channelName);
        });
    }
    isUserIsBan(pair) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.isUserIsBan(pair.channelId, pair.userId);
        });
    }
    blockUser(pairId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('blockUser called');
            console.log(pairId);
            return this.chatService.blockUser(pairId.callerId, pairId.targetId);
        });
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)('getAllConvFromId'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_dto_1.UserIdDto]),
    __metadata("design:returntype", Promise)
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
    (0, common_1.Get)('getLoginsInChannelFromSubstring/:channelId/:substring'),
    __param(0, (0, common_1.Param)('substring')),
    __param(1, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getLoginsInChannelFromSubstring", null);
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
__decorate([
    (0, common_1.Get)('isAdmin/:userId/:channelId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "isAdmin", null);
__decorate([
    (0, common_1.UseGuards)(admin_guards_1.AdminGuard),
    (0, common_1.Post)('kickUserFromChannel/:userId/:channelId/:callerId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('channelId')),
    __param(2, (0, common_1.Param)('callerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "kickUserFromChannel", null);
__decorate([
    (0, common_1.UseGuards)(admin_guards_1.AdminGuard),
    (0, common_1.Post)('banUserFromChannel/:userId/:channelId/:callerId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('channelId')),
    __param(2, (0, common_1.Param)('callerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "banUserFromChannel", null);
__decorate([
    (0, common_1.Post)('leaveChannel/:userId/:channelId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "leaveChannel", null);
__decorate([
    (0, common_1.Get)('getNumberUsersInChannel/:channelId'),
    __param(0, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getNumberUsersInChannel", null);
__decorate([
    (0, common_1.Get)('getAdmins/:channelId'),
    __param(0, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getAdmins", null);
__decorate([
    (0, common_1.Get)('isUserIsInChannel/:userId/:channelId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "isUserIsInChannel", null);
__decorate([
    (0, common_1.Post)('addAdminToChannel/:inviterId/:invitedId/:channelId'),
    __param(0, (0, common_1.Param)('inviterId')),
    __param(1, (0, common_1.Param)('invitedId')),
    __param(2, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addAdminToChannel", null);
__decorate([
    (0, common_1.Post)('removeAdminFromChannel/:inviterId/:invitedId/:channelId'),
    __param(0, (0, common_1.Param)('inviterId')),
    __param(1, (0, common_1.Param)('invitedId')),
    __param(2, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "removeAdminFromChannel", null);
__decorate([
    (0, common_1.Post)('addUserToChannel/:userId/:channelId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addUserToChannel", null);
__decorate([
    (0, common_1.Post)('addUserToProtectedChannel'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_dto_1.SignUpChannelDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addUserToProtectedChannel", null);
__decorate([
    (0, common_1.Post)('isChannelNameExist'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_dto_1.ChannelNameDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "isChannelNameExist", null);
__decorate([
    (0, common_1.Post)('isUserIsBan'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_dto_1.PairUserIdChannelId]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "isUserIsBan", null);
__decorate([
    (0, common_1.Post)('blockUser'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_dto_1.pairUserId]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "blockUser", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);

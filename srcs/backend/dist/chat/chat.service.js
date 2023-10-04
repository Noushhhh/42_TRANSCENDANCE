"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const argon = __importStar(require("argon2"));
const common_2 = require("@nestjs/common");
const common_3 = require("@nestjs/common");
const socket_service_1 = require("./socket.service");
let ChatService = class ChatService {
    constructor(prisma, 
    // "private" to keep utilisation of the service inside the class
    // "readonly" to be sure that socketService can't be substitute with
    // others services (security)
    // @Inject(ChatGateway) private readonly chatGateway: ChatGateway,
    listUser) {
        this.prisma = prisma;
        this.listUser = listUser;
    }
    getAllConvFromId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = Number(id);
            const user = yield this.prisma.user.findUnique({
                where: { id: userId },
                include: { conversations: true },
            });
            if (!user) {
                throw new common_2.ForbiddenException(`User with ID ${userId} not found.`);
            }
            const conversationIds = user.conversations.map((conversation) => conversation.id);
            return conversationIds;
        });
    }
    getLastMessage(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const channelId = Number(id);
            const channel = yield this.prisma.channel.findUnique({
                where: {
                    id: channelId,
                },
            });
            if (!channel) {
                throw new common_2.ForbiddenException("Channel not found");
            }
            const lastMessage = yield this.prisma.message.findFirst({
                where: {
                    channelId: channel.id,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            if (!lastMessage) {
                return null;
            }
            return lastMessage.content;
        });
    }
    getChannelHeadersFromId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const channelId = Number(id);
            if (isNaN(channelId) || channelId <= 0) {
                throw new Error("Bad arguments");
            }
            try {
                const channel = yield this.prisma.channel.findUnique({
                    where: {
                        id: channelId,
                    },
                    include: {
                        messages: {
                            orderBy: {
                                createdAt: 'desc',
                            },
                            take: 1,
                        },
                        participants: {}
                    },
                });
                if (!channel) {
                    throw new Error("getChannelHeadersFromId: channel doesnt exist");
                }
                const lastMessage = channel === null || channel === void 0 ? void 0 : channel.messages[0];
                const numberParticipants = channel.participants.length;
                const channelHeader = {
                    name: numberParticipants > 2 ? channel.name : "",
                    lastMsg: lastMessage ? lastMessage.content : '',
                    dateLastMsg: lastMessage ? lastMessage.createdAt : new Date(0),
                    channelId,
                };
                return channelHeader;
            }
            catch (error) {
                throw new Error("Error fetching database");
            }
        });
    }
    getBlockedUsersById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({
                where: { id: userId },
                include: { blockedUsers: true }
            });
            if (!user)
                throw new common_2.ForbiddenException("User not found");
            return user.blockedUsers.map(user => user.id);
        });
    }
    getAllMessagesByChannelId(userId, channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield this.prisma.channel.findUnique({
                where: {
                    id: channelId,
                },
                include: {
                    messages: true, // Inclure les messages associés au canal
                },
            });
            if (!channel) {
                throw new common_2.ForbiddenException("Channel not found");
            }
            const blockedUsersId = yield this.getBlockedUsersById(userId);
            const filteredMessages = channel.messages.filter((message) => {
                return !blockedUsersId.includes(message.senderId);
            });
            return filteredMessages;
        });
    }
    addMessageToChannelId(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.message.create({
                data: message,
            });
        });
    }
    getUsersFromChannelId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const channelId = Number(id);
            if (isNaN(channelId) || channelId <= 0) {
                throw new Error("Invalid channelId");
            }
            try {
                const users = yield this.prisma.channel.findUnique({
                    where: { id: channelId },
                }).participants();
                if (!users)
                    return [];
                return users;
            }
            catch (error) {
                throw new Error(`getUsersFromChannelId: Failed to get users from channel with ID ${id}`);
            }
        });
    }
    getLoginsFromSubstring(substring) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.prisma.user.findMany({
                where: {
                    username: {
                        startsWith: substring
                    }
                }
            });
            if (!users) {
                throw new Error("Failed to fetch data");
            }
            // const logins = users.map(user => user.username);
            return users;
        });
    }
    addChannelToUser(channelInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const participants = channelInfo.participants.map(userId => ({ id: userId }));
            participants.push({ id: channelInfo.ownerId });
            try {
                const hashPassword = yield argon.hash(channelInfo.password);
                const newChannel = yield this.prisma.channel.create({
                    data: {
                        name: channelInfo.name,
                        password: hashPassword,
                        ownerId: channelInfo.ownerId,
                        // admins: channelInfo.ownerId,
                        type: client_1.ChannelType[channelInfo.type],
                        participants: {
                            connect: participants,
                        },
                        admins: {
                            connect: [{ id: channelInfo.ownerId }]
                        }
                    },
                });
            }
            catch (error) {
                console.error('addChannelToUser:', error);
                throw error;
            }
        });
    }
    isAdmin(usrId, channlId) {
        return __awaiter(this, void 0, void 0, function* () {
            const channelId = Number(channlId);
            const userId = Number(usrId);
            if (isNaN(channelId) || isNaN(userId))
                throw new Error("isAdmin: expected number get non numerical args");
            const channel = yield this.prisma.channel.findUnique({
                where: { id: channelId },
                include: { admins: true },
            });
            if (!channel) {
                return false;
            }
            return channel.admins.some((element) => element.id === userId);
        });
    }
    getNumberUsersInChannel(channelIdStr) {
        return __awaiter(this, void 0, void 0, function* () {
            const channelId = Number(channelIdStr);
            if (isNaN(channelId)) {
                throw new Error(`Invalid args`);
            }
            const channel = yield this.prisma.channel.findUnique({
                where: { id: channelId },
                include: {
                    participants: {},
                }
            });
            if (!channel) {
                throw new Error(`getNumberUsersInChannel didnt found channel with id: ${channelId}`);
            }
            return (channel.participants.length);
        });
    }
    kickUserFromChannel(userIdStr, channelIdStr, callerIdStr) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = Number(userIdStr);
            const channelId = Number(channelIdStr);
            const callerId = Number(callerIdStr);
            if (isNaN(userId) || isNaN(channelId) || isNaN(callerId) || userId <= 0 || channelId <= 0 || callerId <= 0) {
                throw new Error("Invalid arguments");
            }
            if ((yield this.isAdmin(userId, channelId)) === true) {
                throw new common_1.HttpException("You can't kick a channel Admin", common_1.HttpStatus.FORBIDDEN);
            }
            if ((yield this.getNumberUsersInChannel(channelId)) === 2) {
                yield this.deleteAllMessagesInChannel(channelId);
                yield this.prisma.channel.delete({
                    where: { id: channelId },
                });
                this.listUser.alertChannelDeleted(callerId, channelId); // mettre cette func dans un fichier
                return true;
            }
            const response = yield this.prisma.channel.update({
                where: { id: channelId },
                data: {
                    participants: {
                        disconnect: { id: userId }
                    }
                }
            });
            if (!response)
                return false;
            return true;
        });
    }
    deleteAllMessagesInChannel(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.message.deleteMany({
                    where: { channelId, }
                });
            }
            catch (error) {
                throw new Error("Error updating message table");
            }
        });
    }
    banUserFromChannel(userIdStr, channelIdStr, callerIdStr) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = Number(userIdStr);
            const channelId = Number(channelIdStr);
            const callerId = Number(callerIdStr);
            const nbrUser = yield this.getNumberUsersInChannel(channelId);
            try {
                if (isNaN(userId) || userId <= 0 || isNaN(channelId) || channelId <= 0 || isNaN(callerId) || callerId <= 0) {
                    throw new Error("Invalid arguments");
                }
                if ((yield this.isAdmin(userId, channelId)) === true) {
                    throw new common_1.HttpException("You can't ban a channel Admin", common_1.HttpStatus.FORBIDDEN);
                }
                if ((yield this.getNumberUsersInChannel(channelId)) <= 2) {
                    yield this.deleteAllMessagesInChannel(channelId);
                    yield this.prisma.channel.delete({
                        where: { id: channelId },
                    });
                    this.listUser.alertChannelDeleted(callerId, channelId);
                    return true;
                }
                yield this.kickUserFromChannel(userId, channelId, callerId);
                const response = yield this.prisma.channel.update({
                    where: { id: channelId },
                    data: {
                        bannedUsers: {
                            connect: {
                                id: userId,
                            }
                        }
                    }
                });
                return true;
            }
            catch (error) {
                throw new Error("Error updating database");
            }
        });
    }
    leaveChannel(userIdStr, channelIdStr) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = Number(userIdStr);
            const channelId = Number(channelIdStr);
            if (isNaN(userId) || isNaN(channelId))
                return false;
            if ((yield this.getNumberUsersInChannel(channelId)) === 2) {
                yield this.deleteAllMessagesInChannel(channelId);
                yield this.prisma.channel.delete({
                    where: { id: channelId },
                });
                this.listUser.alertChannelDeleted(userId, channelId);
                return true;
            }
            const response = yield this.prisma.channel.update({
                where: { id: channelId },
                data: {
                    participants: {
                        disconnect: { id: userId }
                    }
                }
            });
            if (!response)
                return false;
            return true;
        });
    }
    isUserIsInChannel(userIdStr, channelIdStr) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = Number(userIdStr);
            const channelId = Number(channelIdStr);
            if (isNaN(userId) || isNaN(channelId)) {
                throw new Error("Wrong parameters passed to addAdminToChannel");
            }
            const channel = yield this.prisma.channel.findUnique({
                where: { id: channelId },
                include: { participants: true },
            });
            if (!channel)
                throw new Error("IsUserIsInChannel: user not found");
            return channel.participants.some((elem) => elem.id === userId);
        });
    }
    addAdminToChannel(inviterIdStr, invitedIdStr, channelIdStr) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const inviterId = Number(inviterIdStr);
                const invitedId = Number(invitedIdStr);
                const channelId = Number(channelIdStr);
                if (isNaN(invitedId) || isNaN(inviterId) || isNaN(channelId)) {
                    throw new Error("Wrong parameters passed to addAdminToChannel");
                }
                if ((yield this.isAdmin(inviterId, channelId)) === false) {
                    throw new common_1.HttpException("Is not admin", common_1.HttpStatus.FORBIDDEN);
                }
                if ((yield this.isUserIsInChannel(invitedIdStr, channelId)) === false) {
                    throw new Error("addAdminToChannel: user you want to add to admin is not in channel");
                }
                const userToAdd = yield this.prisma.user.findUnique({
                    where: { id: invitedId }
                });
                if (!userToAdd)
                    return false;
                const response = yield this.prisma.channel.update({
                    where: { id: channelId },
                    data: {
                        admins: {
                            connect: {
                                id: invitedId,
                            }
                        }
                    }
                });
                if (!response)
                    throw new Error("addAdminToChannel: Channel not found");
            }
            catch (error) {
                throw new Error("Error in addAdminToChannel");
            }
            return true;
        });
    }
    removeAdminFromChannel(inviterIdStr, invitedIdStr, channelIdStr) {
        return __awaiter(this, void 0, void 0, function* () {
            const inviterId = Number(inviterIdStr);
            const invitedId = Number(invitedIdStr);
            const channelId = Number(channelIdStr);
            if (isNaN(invitedId) || isNaN(inviterId) || isNaN(channelId)) {
                throw new Error("Wrong parameters passed to addAdminToChannel");
            }
            if (inviterId === invitedId) {
                throw new Error("You can't kick yourself");
            }
            if ((yield this.isAdmin(inviterId, channelId)) === false) {
                console.log("passing here");
                throw new common_1.HttpException("Only admins can remove others admins", common_1.HttpStatus.FORBIDDEN);
            }
            if ((yield this.isAdmin(invitedId, channelId)) === false) {
                console.log("passing here2");
                throw new common_1.HttpException(`user: ${invitedId} is not admin in this channel`, common_1.HttpStatus.FORBIDDEN);
            }
            if ((yield this.isUserIsInChannel(invitedIdStr, channelId)) === false) {
                throw new common_1.HttpException(`user: ${invitedId} is not in channel`, common_1.HttpStatus.FORBIDDEN);
            }
            const userToAdd = yield this.prisma.user.findUnique({
                where: { id: invitedId }
            });
            if (!userToAdd)
                return false;
            const response = yield this.prisma.channel.update({
                where: { id: channelId },
                data: {
                    admins: {
                        disconnect: {
                            id: invitedId,
                        }
                    }
                }
            });
            return true;
        });
    }
    getLoginsInChannelFromSubstring(channelIdStr, substring) {
        return __awaiter(this, void 0, void 0, function* () {
            const channelId = Number(channelIdStr);
            if (isNaN(channelId)) {
                throw new Error("Invalid arguments: ChannelId is NaN");
            }
            const channel = yield this.prisma.channel.findUnique({
                where: { id: channelId },
                include: { participants: true }
            });
            if (!channel) {
                throw new common_1.NotFoundException(`Channel with id ${channelId} not found`);
            }
            const users = channel.participants.filter((user) => user.username.startsWith(substring));
            return users;
        });
    }
    getAdmins(channelIdStr) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const channelId = Number(channelIdStr);
                if (isNaN(channelId) || channelId <= 0) {
                    throw new Error("Invalid arguments");
                }
                const channel = yield this.prisma.channel.findUnique({
                    where: { id: channelId },
                    include: {
                        admins: true
                    }
                });
                if (!channel) {
                    throw new Error("Error fetching data");
                }
                return channel.admins;
            }
            catch (error) {
                throw new Error("Error fetching data");
            }
        });
    }
    addUserToChannel(userIdStr, channelIdStr) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = Number(userIdStr);
                const channelId = Number(channelIdStr);
                const response = yield this.prisma.channel.update({
                    where: { id: channelId },
                    data: {
                        participants: {
                            connect: { id: userId }
                        }
                    }
                });
            }
            catch (error) {
                throw new common_2.ForbiddenException('channel not found');
            }
        });
    }
    isChannelNameExist(channelName) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("isChannelNameExist called with");
            console.log(channelName);
            try {
                const isExist = yield this.prisma.channel.findFirst({
                    where: { name: channelName },
                });
                if (isExist) {
                    return {
                        isExist: true,
                        channelType: isExist.type,
                        id: isExist.id
                    };
                }
                else {
                    return false;
                }
            }
            catch (error) {
                throw new Error("Error searching channel");
            }
        });
    }
    isUserIsBan(channelId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield this.prisma.channel.findUnique({
                where: { id: channelId },
                include: { bannedUsers: true }
            });
            console.log("ici1");
            if (!channel) {
                console.log("ici2");
                throw new common_2.ForbiddenException('channel not found');
                console.log("ici3");
            }
            console.log('4');
            return channel.bannedUsers.some(user => user.id === userId);
        });
    }
    addUserToProtectedChannel(channelId, password, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const channel = yield this.prisma.channel.findUnique({
                    where: { id: channelId }
                });
                if (!channel)
                    throw new common_2.ForbiddenException('Channel not found');
                if (!channel.password)
                    throw new common_2.ForbiddenException('Channel password not found');
                const passwordMatch = yield argon.verify(channel.password, password);
                if (!passwordMatch)
                    throw new common_2.ForbiddenException('Incorrect channel password');
                yield this.addUserToChannel(userId, channelId);
            }
            catch (error) {
                throw error;
            }
        });
    }
    getUserById(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({
                where: { id: channelId }
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with id ${channelId} not found`);
            }
            return user;
        });
    }
    getChannelById(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield this.prisma.channel.findUnique({
                where: { id: channelId }
            });
            if (!channel)
                throw new common_1.NotFoundException(`Channel with id ${channelId} not found`);
            return channel;
        });
    }
    blockUser(callerId, targetId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (callerId === targetId)
                throw new common_3.UnauthorizedException('Can\'t block yourself');
            yield this.getUserById(targetId);
            yield this.getUserById(callerId);
            yield this.prisma.user.update({
                where: { id: callerId },
                data: {
                    blockedUsers: {
                        connect: { id: targetId }
                    }
                }
            });
            yield this.prisma.user.update({
                where: { id: targetId },
                data: {
                    blockedBy: {
                        connect: { id: callerId }
                    }
                }
            });
        });
    }
    unblockUser(callerId, targetId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getUserById(targetId);
            yield this.getUserById(callerId);
            if (callerId === targetId)
                throw new common_3.UnauthorizedException('Can\'t block yourself');
            yield this.prisma.user.update({
                where: { id: callerId },
                data: {
                    blockedUsers: {
                        disconnect: { id: targetId }
                    }
                }
            });
            yield this.prisma.user.update({
                where: { id: targetId },
                data: {
                    blockedBy: {
                        disconnect: { id: callerId }
                    }
                }
            });
        });
    }
    isUserIsBlockedBy(callerId, targetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.prisma.user.findUnique({
                where: { id: callerId },
                include: { blockedUsers: true }
            });
            if (!users)
                return false;
            return users.blockedUsers.some(user => user.id === targetId);
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        socket_service_1.listUserConnected])
], ChatService);

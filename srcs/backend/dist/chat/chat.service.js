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
let ChatService = exports.ChatService = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getAllConvFromId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = Number(id);
            const user = yield this.prisma.user.findUnique({
                where: { id: userId },
                include: { conversations: true },
            });
            if (!user) {
                throw new Error(`User with ID ${userId} not found.`);
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
                return null;
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
    getChannelHeadersFromUserId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const channelId = Number(id);
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
                },
            });
            if (!channel) {
                throw new Error("getChannelHeadersFromUserId: channel doesnt exist");
            }
            const lastMessage = channel === null || channel === void 0 ? void 0 : channel.messages[0];
            if (lastMessage) {
                const lastMessageContent = lastMessage.content;
                const lastMessageCreatedAt = lastMessage.createdAt;
                // Faites ce que vous voulez avec les informations du dernier message
            }
            else {
                // Le canal n'a pas de message
            }
            const channelHeader = {
                name: channel.name,
                lastMsg: lastMessage ? lastMessage.content : '',
                dateLastMsg: lastMessage ? lastMessage.createdAt : new Date(0),
            };
            return channelHeader;
        });
    }
    addChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('add Channel...');
            yield this.prisma.channel.create({
                data: {
                    name: 'first one',
                    type: 'PUBLIC',
                    password: 'ok',
                    owner: {
                        connect: {
                            id: 1
                        }
                    },
                    admins: {
                        connect: [
                            {
                                id: 1
                            }
                        ]
                    },
                    participants: {
                        connect: [
                            {
                                id: 1
                            }
                        ]
                    },
                    messages: {},
                    bannedUsers: {},
                    mutedUsers: {}
                },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    password: true,
                    owner: true,
                    ownerId: true,
                    admins: true,
                    participants: true,
                    messages: true,
                    bannedUsers: true,
                    mutedUsers: true
                }
            });
        });
    }
    addMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('add Channel...');
            yield this.prisma.message.create({
                data: {
                    sender: {
                        connect: {
                            id: 1
                        }
                    },
                    channel: {
                        connect: {
                            id: 11
                        }
                    },
                    content: 'voila new msssg'
                },
                select: {
                    id: true,
                    sender: true,
                    senderId: true,
                    channel: true,
                    channelId: true,
                    content: true,
                    createdAt: true
                }
            });
        });
    }
};
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);

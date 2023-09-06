import { PrismaService } from "../prisma/prisma.service";
import { Message, User } from "@prisma/client";
interface MessageToStore {
    channelId: number;
    content: string;
    senderId: number;
}
interface channelToAdd {
    name: string;
    password: string;
    ownerId: number;
    participants: number[];
    type: string;
}
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllConvFromId(id: number): Promise<number[]>;
    getLastMessage(id: number): Promise<string | null>;
    getChannelHeadersFromId(id: number): Promise<ChannelLight>;
    addChannel(): Promise<void>;
    addMessage(): Promise<void>;
    getAllMessagesByChannelId(id: number): Promise<Message[]>;
    addMessageToChannelId(channId: number, message: MessageToStore): Promise<void>;
    getUsersFromChannelId(id: number): Promise<User[]>;
    getLoginsFromSubstring(substring: string): Promise<{
        username: string;
        id: number;
    }[]>;
    addChannelToUser(channelInfo: channelToAdd): Promise<void>;
}
export {};

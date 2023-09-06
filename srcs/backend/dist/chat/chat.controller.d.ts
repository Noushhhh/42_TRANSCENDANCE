import { ChatService } from "./chat.service";
import { Message, User } from "@prisma/client";
import './interfaces/chat.interface';
interface channelToAdd {
    name: string;
    password: string;
    ownerId: number;
    participants: number[];
    type: string;
}
interface MessageToStore {
    channelId: number;
    content: string;
    senderId: number;
}
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
    getAllConvFromId(id: number): Promise<number[]>;
    addChannel(): Promise<void>;
    addMessage(): Promise<void>;
    getLastMessage(id: number): Promise<string>;
    getChannelHeadersFromUserId(id: number): Promise<ChannelLight>;
    getAllMessagesByChannelId(id: number): Promise<Message[]>;
    addMessageToChannelId(id: number, message: MessageToStore): Promise<void>;
    getUsersFromChannelId(id: number): Promise<User[]>;
    getLoginsFromSubstring(substring: string): Promise<{
        username: string;
        id: number;
    }[]>;
    addChannelToUser(channelInfo: channelToAdd): Promise<void>;
}
export {};

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Channel, Message, User } from "@prisma/client";
import { error } from "console";

interface MessageToStore{
  channelId: number;
	content: string;
	senderId: number;
}

@Injectable()
export class ChatService {

  constructor(private prisma: PrismaService) { }

  async getAllConvFromId(id: number) {

    const userId = Number(id);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { conversations: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    const conversationIds = user.conversations.map((conversation) => conversation.id);
    return conversationIds;
  }

  async getLastMessage(id: number): Promise<string | null> {

    const channelId = Number(id);

    const channel: Channel | null = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!channel) {
      return null;
    }

    const lastMessage: Message | null = await this.prisma.message.findFirst({
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
  }

  async getChannelHeadersFromId(id: number): Promise<ChannelType> {

    const channelId = Number(id);

    const channel = await this.prisma.channel.findUnique({
      where: {
        id:channelId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        participants:{}
      },
    });

    if (!channel)
    {
      throw new Error("getChannelHeadersFromId: channel doesnt exist");
    }

    const lastMessage = channel?.messages[0];
    
    const numberParticipants = channel.participants.length;

    const channelHeader: ChannelType = {
      name: numberParticipants > 2 ? channel.name : "",
      lastMsg: lastMessage ? lastMessage.content : '',
      dateLastMsg: lastMessage ? lastMessage.createdAt : new Date(0),
      channelId,
    };

    return channelHeader;
  }

  async addChannel() {

    console.log('add Channel...');

    await this.prisma.channel.create({
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
    })
  }

  async addMessage() {

    console.log('add message...');

    await this.prisma.message.create({
      data: {
        sender: {
          connect: {
            id: 2
          }
        },
        channel: {
          connect: {
            id: 11
          }
        },
        content: 'Mec je suis trop daccord'
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
  }

  async getAllMessagesByChannelId(id: number): Promise<Message[]>{

    const channelId = Number(id);

    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
      include: {
        messages: true, // Inclure les messages associés au canal
      },
    });

    if (!channel)
    {
      throw new Error('getAllMessageFromChannelId: cant find channel');
    }
  
    return channel.messages;
  }

  async addMessageToChannelId(channId: number, message: MessageToStore){

    await this.prisma.message.create({
      data: message,
    })
  }

  async getUsersFromChannelId(id: number): Promise<User[]>{
    
    const channelId = Number(id);

    try {
      const users = await this.prisma.channel.findUnique({
        where: {id: channelId},
      }).participants();

      if (!users)
        return [];

      return users;

    } catch (error) {
      throw new Error(`getUsersFromChannelId: Failed to get users from channel with ID ${id}`);
    }
  }

  async getLoginsFromSubstring(substring: string): Promise<string[]>{

    if (!substring)
    {
      console.log("secured");
      return [];
    }
    
    const users: {username: string}[] = await this.prisma.user.findMany({
      where: {
        username: {
          startsWith: substring
        }
      },
      select: {
        username: true,
      }
    })
    const logins = users.map(user => user.username);
    return logins;
  }

}


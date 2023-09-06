import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Channel, Message, User, ChannelType } from "@prisma/client";
import { connect } from "rxjs";
import { SocketService } from "../socket/socket.service";
import { SocketEvents } from "../socket/SocketEvents";

interface MessageToStore{
  channelId: number;
	content: string;
	senderId: number;
}

interface channelToAdd{
  name: string,
  password: string
  ownerId: number,
  participants: number[],
  type: string,
}

@Injectable()
export class ChatService {

  constructor(private prisma: PrismaService,
              // "private" to keep utilisation of the service inside the class
              // "readonly" to be sure that socketService can't be substitute with
              // others services (security)
              private readonly socketEvents: SocketEvents
              ) { }

  async getAllConvFromId(id: number): Promise<number[]> {

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

  async getChannelHeadersFromId(id: number): Promise<ChannelLight> {

    const channelId = Number(id);

    if (isNaN(channelId) || channelId <= 0){
      throw new Error("Bad arguments");
    }

    try {

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
    
    const channelHeader: ChannelLight = {
      name: numberParticipants > 2 ? channel.name : "",
      lastMsg: lastMessage ? lastMessage.content : '',
      dateLastMsg: lastMessage ? lastMessage.createdAt : new Date(0),
      channelId,
    };
    
    return channelHeader;
  }
  catch (error){
    throw new Error("Error fetching database");
  }
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

    if (isNaN(channelId) || channelId <= 0){
      throw new Error("Invalid channelId");
    }

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

  async getLoginsFromSubstring(substring: string): Promise<User[]>{

    const users: User[] = await this.prisma.user.findMany({
      where: {
        username: {
          startsWith: substring
        }
      }
    })

    if (!users){
      throw new Error("Failed to fetch data");
    }
    // const logins = users.map(user => user.username);
    return users;
  }

  async addChannelToUser(channelInfo: channelToAdd){

    console.log("add channel to user called");
    console.log(channelInfo.type);

    const participants: { id: number; }[] = channelInfo.participants.map(userId => ({ id: userId }));
    participants.push({id: channelInfo.ownerId});
      
      try {
        const newChannel: Channel = await this.prisma.channel.create({
          data: {
            name: channelInfo.name,
            password: channelInfo.password,
            ownerId: channelInfo.ownerId,
            // admins: channelInfo.ownerId,
            type: ChannelType[channelInfo.type as keyof typeof ChannelType],
            participants: {
              connect: participants,
            },
            admins: {
              connect: [{ id: channelInfo.ownerId }]
            }
          },
        });
      } catch (error){
        console.error('addChannelToUser:', error);
        throw error;
      }
    }

    async isAdmin(usrId: number, channlId: number): Promise<boolean>{

      const channelId = Number(channlId);
      const userId = Number(usrId);

      if (isNaN(channelId) || isNaN(userId))
        throw new Error("isAdmin: expected number get non numerical args");

      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
        include: { admins: true },
      });

      if (!channel){
        return false;
      }

      return channel.admins.some((element) => element.id === userId);
    }

    async getNumberUsersInChannel(channelIdStr: number): Promise<number>{
      
      const channelId: number = Number(channelIdStr);

      if (isNaN(channelId)){
        throw new Error(`Invalid args`);
      }

      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
        include: {
          participants:{},
        }
      }
      );

      if (!channel){
        throw new Error(`getNumberUsersInChannel didnt found channel with id: ${channelId}`);
      }
      
      return (channel.participants.length);
    }
    
    async kickUserFromChannel(userIdStr: number, channelIdStr: number, callerId: number): Promise<boolean>{

      const userId = Number(userIdStr);
      const channelId = Number(channelIdStr);

      if (isNaN(userId) || isNaN(channelId) || isNaN(callerId) || userId <= 0 || channelId <= 0 || callerId <=0){
        throw new Error("Invalid arguments");
      }

      if (await this.isAdmin(userId, channelId) === true){
        throw new HttpException("You can't kick a channel Admin",
        HttpStatus.FORBIDDEN);
      }

      if (await this.isAdmin(callerId, channelId) === false){
        throw new HttpException("Only administrator can ban users",
        HttpStatus.FORBIDDEN);
      }

      if (await this.getNumberUsersInChannel(channelId) === 2){
        console.log("channel need to be deleted");
        await this.deleteAllMessagesInChannel(channelId);
        await this.prisma.channel.delete({
          where: { id: channelId },
        })
        this.socketEvents.alertChannelDeleted(userId, channelId);
        return true;
      }

      const response: Channel = await this.prisma.channel.update({
        where: { id: channelId },
        data: { participants: {
          disconnect: { id: userId }
        } }
      })

      if (!response)
        return false;

      return true;
    }

    async deleteAllMessagesInChannel(channelId: number): Promise<void>{
    
      try {
        await this.prisma.message.deleteMany({
          where: { channelId, }
        });
      } catch (error){
        throw new Error("Error updating message table");
      }
    }

    async banUserFromChannel(userIdStr: number, channelIdStr: number, callerIdStr: number): Promise<boolean>{

      const userId = Number(userIdStr);
      const channelId = Number(channelIdStr);
      const callerId = Number(callerIdStr);
      
      const nbrUser: number = await this.getNumberUsersInChannel(channelId);
            
      try {

        if (isNaN(userId) || userId <= 0 || isNaN(channelId) || channelId <= 0 || isNaN(callerId) || callerId <= 0){
          throw new Error("Invalid arguments");
        }
        
        if (await this.isAdmin(callerId, channelId) === false){
          throw new HttpException("Only administrator can ban users",
          HttpStatus.FORBIDDEN);
        }

        if (await this.isAdmin(userId, channelId) === true){
          throw new HttpException("You can't ban a channel Admin",
          HttpStatus.FORBIDDEN);
        }
        
        if (await this.getNumberUsersInChannel(channelId) <= 2){
          console.log(`channel need to be deleted: ${channelId}`);
          await this.deleteAllMessagesInChannel(channelId);
          await this.prisma.channel.delete({
            where: { id: channelId },
          })
          this.socketEvents.alertChannelDeleted(userId, channelId);
          return true;
      }
      
      await this.kickUserFromChannel(userId, channelId, callerId);
      
      const response = await this.prisma.channel.update({
        where: { id: channelId },
        data: {
          bannedUsers:{
            connect:{
              id: userId,
            }
          }
        }
      })
      return true;
    } catch (error){
      console.log(error);
      throw new Error("Error updating database");
    }

    }

    async leaveChannel(userIdStr: number, channelIdStr: number): Promise<boolean>{

      const userId = Number(userIdStr);
      const channelId = Number(channelIdStr);

      if (isNaN(userId) || isNaN(channelId))
        return false;

      if (await this.getNumberUsersInChannel(channelId) === 2){
        this.deleteAllMessagesInChannel(channelId);
        await this.prisma.channel.delete({
          where: { id: channelId },
        })
        this.socketEvents.alertChannelDeleted(userId, channelId);
        return true;
      }

      const response: Channel = await this.prisma.channel.update({
        where: { id: channelId },
        data: { participants: {
          disconnect: { id: userId }
        } }
      })

      if (!response)
        return false;

      return true;
    }

    async isUserIsInChannel(userIdStr: number, channelIdStr: number): Promise<boolean>{

      console.log("isUserisInChannel called");

      const userId: number = Number(userIdStr);
      const channelId: number = Number(channelIdStr);

      if (isNaN(userId) || isNaN(channelId)){
        throw new Error("Wrong parameters passed to addAdminToChannel");
      }

      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
        include: { participants: true },
      });
      
      if (!channel)
        throw new Error("IsUserIsInChannel: user not found");

      console.log(channel);

      return channel.participants.some((elem) => elem.id === userId);
    }

    async addAdminToChannel(inviterIdStr: number, invitedIdStr: number, channelIdStr: number): Promise<boolean>{

      console.log("addAdminToChannel called");

      try{

        const inviterId: number = Number(inviterIdStr);
        const invitedId: number = Number(invitedIdStr);
        const channelId: number = Number(channelIdStr);

        if (isNaN(invitedId) || isNaN(inviterId) || isNaN(channelId)){
          throw new Error("Wrong parameters passed to addAdminToChannel");
        }

        if (await this.isAdmin(inviterId, channelId) === false){
        throw new HttpException("Is not admin",
          HttpStatus.FORBIDDEN);
        }

        if (await this.isUserIsInChannel(invitedIdStr, channelId) === false){
          throw new Error("addAdminToChannel: user you want to add to admin is not in channel")
        }

        const userToAdd = await this.prisma.user.findUnique({
          where: { id: invitedId }
        })
        
        if (!userToAdd)
          return false;

        const response = await this.prisma.channel.update({
          where: { id: channelId },
          data: {
            admins: {
              connect: {
                id: invitedId,
              }
            }
          }
        })
        if (!response)
          throw new Error("addAdminToChannel: Channel not found");
      } catch(error) {
        throw new Error("Error in addAdminToChannel");
      }
        return true;
      }

      async removeAdminFromChannel(inviterIdStr: number, invitedIdStr: number, channelIdStr: number): Promise<boolean>{

        console.log("removeAdminFromChannel called");
  
        try{
  
          const inviterId: number = Number(inviterIdStr);
          const invitedId: number = Number(invitedIdStr);
          const channelId: number = Number(channelIdStr);
  
          if (isNaN(invitedId) || isNaN(inviterId) || isNaN(channelId)){
            throw new Error("Wrong parameters passed to addAdminToChannel");
          }

          if (inviterId === invitedId){
            throw new Error("You can't kick yourself");
          }
  
          if (await this.isAdmin(inviterId, channelId) === false){
          throw new HttpException("Only admins can remove others admins",
            HttpStatus.FORBIDDEN);
          }

          if (await this.isAdmin(invitedId, channelId) === false){
            throw new HttpException(`user: ${invitedId} is not admin in this channel`,
              HttpStatus.FORBIDDEN);
            }
  
          if (await this.isUserIsInChannel(invitedIdStr, channelId) === false){
            throw new Error("addAdminToChannel: user you want to add to admin is not in channel")
          }
  
          const userToAdd = await this.prisma.user.findUnique({
            where: { id: invitedId }
          })
          
          if (!userToAdd)
            return false;
  
          const response = await this.prisma.channel.update({
            where: { id: channelId },
            data: {
              admins: {
                disconnect: {
                  id: invitedId,
                }
              }
            }
          })
          if (!response)
            throw new Error("removeAdmin: error posting data");
        } catch(error) {
          throw new Error("Error in removeAdminFromChannel");
        }
          return true;
        }

      async getLoginsInChannelFromSubstring(channelIdStr: number, substring: string, ): Promise<User[]>{

        const channelId: number = Number(channelIdStr);

        if (isNaN(channelId)){
          throw new Error("Invalid arguments: ChannelId is NaN");
        }

        const channel = await this.prisma.channel.findUnique({
          where: { id: channelId },
          include: { participants: true }
        })

        if (!channel){
          throw new NotFoundException(`Channel with id ${channelId} not found`);
        }

        const users: User[] = channel.participants.filter((user) => user.username.startsWith(substring));

        return users;
      }

      async getAdmins(channelIdStr: number): Promise<User[]>{

        try{

          const channelId: number = Number(channelIdStr);

          if (isNaN(channelId) || channelId <= 0){
            throw new Error("Invalid arguments");
          }

          const channel = await this.prisma.channel.findUnique({
            where: { id: channelId },
            include: { 
              admins: true
             }
          })

          if (!channel){
            throw new Error("Error fetching data");
          }

          return channel.admins;

        } catch(error){
          throw new Error("Error fetching data");
        }
      }

      async addUserToChannel(userIdStr: number, channelIdStr: number): Promise<void>{
        try{

          const userId: number = Number(userIdStr);
          const channelId: number = Number(channelIdStr);

          const response = await this.prisma.channel.update({
            where: { id: channelId },
            data: {
              participants: {
                connect: { id: userId }
              }
            }
          })

        } catch (error){
          throw new Error("Error updating database");
        }
      }
      
    }



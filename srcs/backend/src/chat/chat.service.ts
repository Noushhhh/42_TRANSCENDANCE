import { HttpException, HttpStatus, Injectable, Inject, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Channel, Message, User, ChannelType } from "@prisma/client";
import { ChatGateway } from "./chat.gateway";
import * as argon from 'argon2';
import { ForbiddenException } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { listUserConnected } from "./socket.service";

interface MessageToStore {
  channelId: number;
  content: string;
  senderId: number;
}

interface channelToAdd {
  name: string,
  password: string,
  ownerId: number,
  participants: number[],
  type: string,
}

interface isChannelExist {
  isExist: boolean,
  channelType: ChannelType,
  id: number,
}

@Injectable()
export class ChatService {

  constructor(private prisma: PrismaService,
    // "private" to keep utilisation of the service inside the class
    // "readonly" to be sure that socketService can't be substitute with
    // others services (security)
    // @Inject(ChatGateway) private readonly chatGateway: ChatGateway,
    private readonly listUser: listUserConnected,
  ) { }

  async getAllConvFromId(id: number): Promise<number[]> {

    const userId = Number(id);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { conversations: true },
    });

    if (!user) {
      throw new ForbiddenException(`User with ID ${userId} not found.`);
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
      throw new ForbiddenException("Channel not found");
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

  async getChannelHeadersFromId(channelId: number, userId: number): Promise<ChannelLight> {

    try {
      const channel = await this.prisma.channel.findUnique({
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
        throw new ForbiddenException("Channel does not exist");
      }

      let lastMessage = channel.messages[0];

      const numberParticipants = channel.participants.length;

      const channelHeader: ChannelLight = {
        name: numberParticipants > 2 ? channel.name : "",
        lastMsg: lastMessage ? lastMessage.content : '',
        dateLastMsg: lastMessage ? lastMessage.createdAt : null,
        channelId,
      };

      let userBlockedLastMessageSender: boolean = false;
  
      if (lastMessage)
        userBlockedLastMessageSender = await this.isUserIsBlockedBy(userId, lastMessage.senderId);

      if (userBlockedLastMessageSender)
        channelHeader.lastMsg = "";

      return channelHeader;
    }
    catch (error) {
      throw new Error("Error fetching database");
    }
  }

  async getBlockedUsersById(userId: number): Promise<number[]> {

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { blockedUsers: true }
    })

    if (!user)
      throw new ForbiddenException("User not found");

    return user.blockedUsers.map(user => user.id);
  }

  async getAllMessagesByChannelId(userId: number, channelId: number): Promise<Message[]> {

    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
      include: {
        messages: true, // Inclure les messages associés au canal
      },
    });

    if (!channel) {
      throw new ForbiddenException("Channel not found");
    }

    const blockedUsersId: number[] = await this.getBlockedUsersById(userId);

    const filteredMessages: Message[] = channel.messages.filter((message) => {
      return !blockedUsersId.includes(message.senderId);
    });
  
    return filteredMessages;
  }

  async addMessageToChannelId(message: MessageToStore) {

    await this.prisma.message.create({
      data: message,
    })
  }

  async getUsersFromChannelId(id: number): Promise<User[]> {

    const channelId = Number(id);

    if (isNaN(channelId) || channelId <= 0) {
      throw new Error("Invalid channelId");
    }

    try {
      const users = await this.prisma.channel.findUnique({
        where: { id: channelId },
      }).participants();

      if (!users)
        return [];

      return users;

    } catch (error) {
      throw new Error(`getUsersFromChannelId: Failed to get users from channel with ID ${id}`);
    }
  }

  async getLoginsFromSubstring(substring: string): Promise<User[]> {

    const users: User[] = await this.prisma.user.findMany({
      where: {
        username: {
          startsWith: substring
        }
      }
    })

    if (!users) {
      throw new ForbiddenException("No user found");
    }
    // const logins = users.map(user => user.username);
    return users;
  }

  async addChannelToUser(channelInfo: channelToAdd) {

    const participants: { id: number; }[] = channelInfo.participants.map(userId => ({ id: userId }));
    participants.push({ id: channelInfo.ownerId });

    try {
      const hashPassword = await argon.hash(channelInfo.password);
      const newChannel: Channel = await this.prisma.channel.create({
        data: {
          name: channelInfo.name,
          password: hashPassword,
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
    } catch (error) {
      console.error('addChannelToUser:', error);
      throw error;
    }
  }

  async isAdmin(usrId: number, channlId: number): Promise<boolean> {

    const channelId = Number(channlId);
    const userId = Number(usrId);

    if (isNaN(channelId) || isNaN(userId))
      throw new Error("isAdmin: expected number get non numerical args");

    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { admins: true },
    });

    if (!channel) {
      return false;
    }

    return channel.admins.some((element) => element.id === userId);
  }

  async getNumberUsersInChannel(channelIdStr: number): Promise<number> {

    const channelId: number = Number(channelIdStr);

    if (isNaN(channelId)) {
      throw new Error(`Invalid args`);
    }

    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        participants: {},
      }
    }
    );

    if (!channel) {
      throw new Error(`getNumberUsersInChannel didnt found channel with id: ${channelId}`);
    }

    return (channel.participants.length);
  }

  async kickUserFromChannel(userIdStr: number, channelIdStr: number, callerIdStr: number): Promise<boolean> {

    const userId = Number(userIdStr);
    const channelId = Number(channelIdStr);
    const callerId = Number(callerIdStr);

    if (isNaN(userId) || isNaN(channelId) || isNaN(callerId) || userId <= 0 || channelId <= 0 || callerId <= 0) {
      throw new Error("Invalid arguments");
    }

    if (await this.isAdmin(userId, channelId) === true) {
      throw new HttpException("You can't kick a channel Admin",
        HttpStatus.FORBIDDEN);
    }

    if (await this.getNumberUsersInChannel(channelId) === 2) {
      await this.deleteAllMessagesInChannel(channelId);
      await this.prisma.channel.delete({
        where: { id: channelId },
      })
      this.listUser.alertChannelDeleted(callerId, channelId); // mettre cette func dans un fichier
      return true;
    }

    const response: Channel = await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        participants: {
          disconnect: { id: userId }
        }
      }
    })

    if (!response)
      return false;

    return true;
  }

  async deleteAllMessagesInChannel(channelId: number): Promise<void> {

    try {
      await this.prisma.message.deleteMany({
        where: { channelId, }
      });
    } catch (error) {
      throw new Error("Error updating message table");
    }
  }

  async banUserFromChannel(userIdStr: number, channelIdStr: number, callerIdStr: number): Promise<boolean> {

    const userId = Number(userIdStr);
    const channelId = Number(channelIdStr);
    const callerId = Number(callerIdStr);

    const nbrUser: number = await this.getNumberUsersInChannel(channelId);

    try {

      if (isNaN(userId) || userId <= 0 || isNaN(channelId) || channelId <= 0 || isNaN(callerId) || callerId <= 0) {
        throw new Error("Invalid arguments");
      }

      if (await this.isAdmin(userId, channelId) === true) {
        throw new HttpException("You can't ban a channel Admin",
          HttpStatus.FORBIDDEN);
      }

      if (await this.getNumberUsersInChannel(channelId) <= 2) {
        await this.deleteAllMessagesInChannel(channelId);
        await this.prisma.channel.delete({
          where: { id: channelId },
        })
        this.listUser.alertChannelDeleted(callerId, channelId);
        return true;
      }

      await this.kickUserFromChannel(userId, channelId, callerId);

      const response = await this.prisma.channel.update({
        where: { id: channelId },
        data: {
          bannedUsers: {
            connect: {
              id: userId,
            }
          }
        }
      })
      return true;
    } catch (error) {
      throw new Error("Error updating database");
    }

  }

  async leaveChannel(userIdStr: number, channelIdStr: number): Promise<boolean> {

    const userId = Number(userIdStr);
    const channelId = Number(channelIdStr);

    if (isNaN(userId) || isNaN(channelId))
      return false;

    if (await this.getNumberUsersInChannel(channelId) === 2) {
      await this.deleteAllMessagesInChannel(channelId);
      await this.prisma.channel.delete({
        where: { id: channelId },
      })
      this.listUser.alertChannelDeleted(userId, channelId);
      return true;
    }

    const response: Channel = await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        participants: {
          disconnect: { id: userId }
        }
      }
    })

    if (!response)
      return false;

    return true;
  }

  async isUserIsInChannel(userIdStr: number, channelIdStr: number): Promise<boolean> {

    const userId: number = Number(userIdStr);
    const channelId: number = Number(channelIdStr);

    if (isNaN(userId) || isNaN(channelId)) {
      throw new Error("Wrong parameters passed to addAdminToChannel");
    }

    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { participants: true },
    });

    if (!channel)
      throw new Error("IsUserIsInChannel: user not found");

    return channel.participants.some((elem) => elem.id === userId);
  }

  async addAdminToChannel(inviterIdStr: number, invitedIdStr: number, channelIdStr: number): Promise<boolean> {

    try {

      const inviterId: number = Number(inviterIdStr);
      const invitedId: number = Number(invitedIdStr);
      const channelId: number = Number(channelIdStr);

      if (isNaN(invitedId) || isNaN(inviterId) || isNaN(channelId)) {
        throw new Error("Wrong parameters passed to addAdminToChannel");
      }

      if (await this.isAdmin(inviterId, channelId) === false) {
        throw new HttpException("Is not admin",
          HttpStatus.FORBIDDEN);
      }

      if (await this.isUserIsInChannel(invitedIdStr, channelId) === false) {
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
    } catch (error) {
      throw new Error("Error in addAdminToChannel");
    }
    return true;
  }

  async removeAdminFromChannel(inviterIdStr: number, invitedIdStr: number, channelIdStr: number): Promise<boolean> {


      const inviterId: number = Number(inviterIdStr);
      const invitedId: number = Number(invitedIdStr);
      const channelId: number = Number(channelIdStr);

      if (isNaN(invitedId) || isNaN(inviterId) || isNaN(channelId)) {
        throw new Error("Wrong parameters passed to addAdminToChannel");
      }

      if (inviterId === invitedId) {
        throw new Error("You can't kick yourself");
      }

      if (await this.isAdmin(inviterId, channelId) === false) {
        console.log("passing here");
        throw new HttpException("Only admins can remove others admins",
          HttpStatus.FORBIDDEN);
      }

      if (await this.isAdmin(invitedId, channelId) === false) {
        console.log("passing here2");
        throw new HttpException(`user: ${invitedId} is not admin in this channel`,
          HttpStatus.FORBIDDEN);
      }

      if (await this.isUserIsInChannel(invitedIdStr, channelId) === false) {
        throw new HttpException(`user: ${invitedId} is not in channel`,
          HttpStatus.FORBIDDEN);
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

    return true;
  }

  async getLoginsInChannelFromSubstring(channelIdStr: number, substring: string): Promise<User[]> {

    const channelId: number = Number(channelIdStr);

    if (isNaN(channelId)) {
      throw new Error("Invalid arguments: ChannelId is NaN");
    }

    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { participants: true }
    })

    if (!channel) {
      throw new NotFoundException(`Channel with id ${channelId} not found`);
    }

    const users: User[] = channel.participants.filter((user) => user.username.startsWith(substring));

    return users;
  }

  async getAdmins(channelIdStr: number): Promise<User[]> {

    try {

      const channelId: number = Number(channelIdStr);

      if (isNaN(channelId) || channelId <= 0) {
        throw new Error("Invalid arguments");
      }

      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
        include: {
          admins: true
        }
      })

      if (!channel) {
        throw new Error("Error fetching data");
      }

      return channel.admins;

    } catch (error) {
      throw new Error("Error fetching data");
    }
  }

  async addUserToChannel(userIdStr: number, channelIdStr: number): Promise<void> {
    try {

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

    } catch (error) {
      throw new ForbiddenException('channel not found');
    }
  }

  async isChannelNameExist(channelName: string): Promise<isChannelExist | false> {
    console.log("isChannelNameExist called with");
    console.log(channelName);
    try {
      const isExist = await this.prisma.channel.findFirst({
        where: { name: channelName },
      })
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
    } catch (error) {
      throw new Error("Error searching channel");
    }
  }

  async isUserIsBan(channelId: number, userId: number): Promise<boolean> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { bannedUsers: true }
    });
    console.log("ici1");
    if (!channel) {
      console.log("ici2");
      throw new ForbiddenException('channel not found');
      console.log("ici3");
    }
    console.log('4');
    return channel.bannedUsers.some(user => user.id === userId);
  }

  async addUserToProtectedChannel(channelId: number, password: string, userId: number): Promise<void> {
    try {
      const channel: Channel | null = await this.prisma.channel.findUnique({
        where: { id: channelId }
      });
      if (!channel)
        throw new ForbiddenException('Channel not found');
      if (!channel.password)
        throw new ForbiddenException('Channel password not found');
      const passwordMatch = await argon.verify(channel.password, password);
      if (!passwordMatch)
        throw new ForbiddenException('Incorrect channel password');
      await this.addUserToChannel(userId, channelId);
    } catch (error) {
      throw error;
    }
  }

  async getUserById(channelId: number): Promise<User | null> {

    const user: User | null = await this.prisma.user.findUnique({
      where: { id: channelId }
    })
    if (!user) {
      throw new NotFoundException(`User with id ${channelId} not found`);
    }
    return user;
  }

  async getChannelById(channelId: number): Promise<Channel | null> {
    const channel: Channel | null = await this.prisma.channel.findUnique({
      where: { id: channelId }
    })
    if (!channel)
      throw new NotFoundException(`Channel with id ${channelId} not found`);
    return channel;
  }

  async blockUser(callerId: number, targetId: number) {

    if (callerId === targetId)
      throw new UnauthorizedException('Can\'t block yourself');

    await this.getUserById(targetId);
    await this.getUserById(callerId);

    await this.prisma.user.update({
      where: { id: callerId },
      data: {
        blockedUsers: {
          connect: { id: targetId }
        }
      }
    })
    await this.prisma.user.update({
      where: { id: targetId },
      data: {
        blockedBy: {
          connect: { id: callerId }
        }
      }
    })
  }

  async unblockUser(callerId: number, targetId: number) {

    await this.getUserById(targetId);
    await this.getUserById(callerId);

    if (callerId === targetId)
      throw new UnauthorizedException('Can\'t block yourself');

    await this.prisma.user.update({
      where: { id: callerId },
      data: {
        blockedUsers: {
          disconnect: { id: targetId }
        }
      }
    })
    await this.prisma.user.update({
      where: { id: targetId },
      data: {
        blockedBy: {
          disconnect: { id: callerId }
        }
      }
    })
  }

  async isUserIsBlockedBy(callerId: number, targetId: number): Promise<boolean> {

    const users = await this.prisma.user.findUnique({
      where: { id: callerId },
      include: { blockedUsers: true }
    })

    if (!users)
      return false;

    return users.blockedUsers.some(user => user.id === targetId);
  }

}

import { HttpException, HttpStatus, Injectable, Inject, NotFoundException, BadRequestException, NotAcceptableException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Channel, Message, User, ChannelType, MutedUser } from "@prisma/client";
import { ChatGateway } from "./chat.gateway";
import * as argon from 'argon2';
import { ForbiddenException } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { SocketService } from "./socket.service";
import { ChannelNameDto, PairUserIdChannelId, muteDto } from "./dto/chat.dto";
import { ChannelIdPostDto, UserIdPostDto, MessageToStoreDto } from "./dto/chat.dto";
import { UsersService } from "../users/users.service";

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
    private readonly socketService: SocketService,
    private readonly userService: UsersService,
  ) { }

  async getAllConvFromId(id: number): Promise<number[]> {

    const user = await this.prisma.user.findUnique({
      where: { id, },
      include: { conversations: true },
    });

    if (!user) {
      throw new ForbiddenException(`User with ID ${id} not found.`);
    }

    const conversationIds = user.conversations.map((conversation) => conversation.id);
    return conversationIds;
  }

  async getChannelName(channelId: number, callerId: number): Promise<string> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        participants: {}
      }
    });
    if (!channel)
      throw new Error("Channel not found");
    const numberUsersInChannel: number = channel.participants.length;
    if (numberUsersInChannel === 2) {
      return (callerId === channel.participants[0].id ? channel.participants[1].username : channel.participants[0].username)
    }
    return channel.name;
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

    const messagesWithoutBlockedSender: Message[] = channel.messages.filter((message) => {
      return !blockedUsersId.includes(message.senderId);
    });

    // const messagesWithoutMutedSenders: Message[] = await this.removeMutedFromMessageList(channelId, messagesWithoutBlockedSender);

    return messagesWithoutBlockedSender;
  }

  async addMessageToChannelId(message: MessageToStoreDto) {

    await this.getChannelById(message.channelId);

    let isUserMuted: { isMuted: boolean, isSet: boolean, rowId: number };
    isUserMuted = await this.isMute({userId: message.senderId, channelId: message.channelId});

    if (isUserMuted.isMuted === true)
      return;

    await this.prisma.message.create({
      data: {
        content: message.content,
        senderId: message.senderId,
        channelId: message.channelId,
      }
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
    return users;
  }

  async addChannelToUser(channelInfo: channelToAdd): Promise<number> {

    const channels = await this.prisma.channel.findMany();
    const existingChannelNames = channels.map(channel => channel.name);

    if (existingChannelNames.some(channelName => channelInfo.name === channelName))
      if (channelInfo.name) {
        console.log("channel must be unique!!");
        throw new HttpException("ChannelName must be unique", HttpStatus.NOT_ACCEPTABLE);
      }

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
      if (!newChannel)
        throw new Error("Error creating channel");
      return newChannel.id;
    } catch (error) {
      throw error;
    }
  }

  async isAdmin(userId: number, channelId: number): Promise<boolean> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: Number(channelId) },
      include: { admins: true },
    });

    if (!channel) {
      return false;
    }

    return channel.admins.some((element) => element.id === Number(userId));
  }

  async isOwner(userId: number, channelId: number): Promise<boolean> {
    const channel = await this.getChannelById(channelId);

    if (!channel) {
      return false;
    }

    if (channel.ownerId === userId)
      return true;
    return false;
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
        HttpStatus.NOT_ACCEPTABLE);
    }

    if (await this.getNumberUsersInChannel(channelId) === 2) {
      await this.deleteAllMessagesInChannel(channelId);
      await this.prisma.channel.delete({
        where: { id: channelId },
      })
      this.socketService.alertChannelDeleted(callerId, channelId); // mettre cette func dans un fichier
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


    if (isNaN(userId) || userId <= 0 || isNaN(channelId) || channelId <= 0 || isNaN(callerId) || callerId <= 0) {
      throw new Error("Invalid arguments");
    }
    const nbrUser: number = await this.getNumberUsersInChannel(channelId);

    if (await this.isAdmin(userId, channelId) === true) {
      throw new HttpException("You can't ban a channel Admin",
        HttpStatus.NOT_ACCEPTABLE);
    }

    if (await this.getNumberUsersInChannel(channelId) <= 2) {
      await this.deleteAllMessagesInChannel(channelId);
      await this.prisma.channel.delete({
        where: { id: channelId },
      })
      this.socketService.alertChannelDeleted(callerId, channelId);
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
  }

  async leaveChannel(userIdStr: number, channelIdStr: number, newOwnerId?: number): Promise<boolean> {

    const userId = Number(userIdStr);
    const channelId = Number(channelIdStr);

    if (isNaN(userId) || isNaN(channelId))
      return false;

    await this.getChannelById(channelId);

    if (! await this.isUserIsInChannel(userId, channelId))
      throw new ForbiddenException("user is not in channel");

    if (await this.isOwner(userId, channelId)) {
      if (!newOwnerId)
        throw new ForbiddenException("If you leave as owner, provide a new owner");
      if (! await this.isUserIsInChannel(newOwnerId, channelId))
        throw new NotFoundException("Provided owner is not channel member");
      await this.prisma.channel.update({
        where: { id: channelId },
        data: {
          participants: {
            disconnect: { id: userId }
          },
          admins: {
            connect: { id: newOwnerId },
            disconnect: { id: userId },
          },
          ownerId: newOwnerId,
        }
      })
      return true;
    }

    if (await this.isAdmin(userId, channelId))
      throw new HttpException("Admin can't leave channel", HttpStatus.NOT_ACCEPTABLE);

    if (await this.getNumberUsersInChannel(channelId) === 2) {
      await this.deleteAllMessagesInChannel(channelId);
      await this.prisma.channel.delete({
        where: { id: channelId },
      })
      this.socketService.alertChannelDeleted(userId, channelId);
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
        throw new ForbiddenException("Is not admin");
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
      throw new HttpException("You can't kick yourself", HttpStatus.FORBIDDEN);
    }

    if (await this.isAdmin(inviterId, channelId) === false) {
      throw new HttpException("Only admins can remove others admins",
        HttpStatus.FORBIDDEN);
    }

    if (await this.isAdmin(invitedId, channelId) === false) {
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

  async getLoginsInChannelFromSubstring(channelIdStr: number, substring: string, userId: number): Promise<User[]> {

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

    const caller: User | undefined = await this.userService.findUserWithId(userId);

    if (!caller)
      throw new NotFoundException("User not found");

    const users: User[] = channel.participants.filter((user) => user.username.startsWith(substring));

    return users.filter(user => user.username !== caller.username);
  }

  async getAdmins(channelId: number): Promise<User[]> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        admins: true
      }
    })
    if (!channel) {
      throw new NotFoundException("Channel not found");
    }
    return channel.admins;
  }

  async addUserToChannel(userIdStr: number, channelIdStr: number): Promise<number> {
    const userId: number = Number(userIdStr);
    const channelId: number = Number(channelIdStr);

    if (await this.isUserIsBan(channelId, userId))
      throw new HttpException("User is ban from this channel", HttpStatus.NOT_ACCEPTABLE);

    const channel = await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        participants: {
          connect: { id: userId }
        }
      }
    })

    if (!channel)
      throw new NotFoundException("Channel not found");
    return channel.id;
  }

  async isChannelNameExist(channelName: string): Promise<isChannelExist | false> {
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
    if (!channel) {
      throw new ForbiddenException('channel not found');
    }
    return channel.bannedUsers.some(user => user.id === userId);
  }

  async addUserToProtectedChannel(channelId: number, password: string, userId: number): Promise<void> {
    try {
      const channel = await this.getChannelById(channelId);
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

  async getChannelById(channelId: number): Promise<Channel> {
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

  async manageChannelPassword(channelId: number, channelType: string, actualPassword: string, newPassword: string) {
    const channel = await this.getChannelById(channelId);
    if (!channel.password)
      return;
    if (channel.type === "PASSWORD_PROTECTED") {
      const passwordMatch = await argon.verify(channel.password, actualPassword);
      if (!passwordMatch)
        throw new ForbiddenException('Incorrect channel password');
    }
    if (channelType === "PASSWORD_PROTECTED") {
      const hashPassword = await argon.hash(newPassword);
      await this.prisma.channel.update({
        where: { id: channelId },
        data: {
          type: channelType as ChannelType,
          password: hashPassword,
        }
      })
      return;
    }
    await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        type: channelType as ChannelType
      }
    })
  }

  async manageChannelType(channelId: number, channelType: string) {
    if (channelType === "PASSWORD_PROTECTED")
      return;

    const channelCheck = await this.getChannelById(channelId);

    if (channelCheck.type === "PASSWORD_PROTECTED")
      throw new ForbiddenException("Forbidden access");

    const channel = await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        type: channelType as ChannelType,
      }
    })

    if (!channel)
      throw new NotFoundException("Channel not found");
  }

  async getChannelType(channelId: number) {
    const channel = await this.getChannelById(channelId);
    return channel.type;
  }

  async getMutedIds(channelId: number): Promise<number[]> {
    await this.getChannelById(channelId);

    const mutedUsers: MutedUser[] = await this.prisma.mutedUser.findMany({
      where: { channelId, },
    })

    if (!mutedUsers)
      throw new NotFoundException("Error fetching muted users");

    const now: Date = new Date();

    // as we fetched "mutedUsers", we know need to check if their
    // "mutedUntil" Date is before or after "now" Date.
    const actuallyMutedIds = mutedUsers
      .filter(user => user.mutedUntil !== null && user.mutedUntil > now)
      .map(user => user.id);

    return actuallyMutedIds;
  }

  async removeMutedFromMessageList(channelId: number, messages: Message[]): Promise<Message[]> {

    const mutedUserIds: number[] = await this.getMutedIds(channelId);

    const messagesWithoutMutedUsers: Message[] = messages.filter(message => {
      return !mutedUserIds.includes(message.senderId);
    })

    return messagesWithoutMutedUsers;
  }

  async isMute(dto: PairUserIdChannelId): Promise<{ isMuted: boolean, isSet: boolean, rowId: number }> {

    await this.getChannelById(dto.channelId);

    const mutedUsersFromChannel = await this.prisma.mutedUser.findMany({
      where: { channelId: dto.channelId }
    })

    if (!mutedUsersFromChannel)
      throw new NotFoundException("Muted users not found");

    const mutedUser: MutedUser | undefined = mutedUsersFromChannel.find(mutedUser => mutedUser.userId === dto.userId);

    const now: Date = new Date();

    if (mutedUser) {
      let isMuted: boolean;
      if (!mutedUser.mutedUntil)
        return { isMuted: false, isSet: true, rowId: mutedUser.id };
      mutedUser.mutedUntil > now ? isMuted = true : isMuted = false;
      return { isMuted, isSet: true, rowId: mutedUser.id };
    }
    return { isMuted: false, isSet: false, rowId: -1 };
  }

  async mute(dto: muteDto) {

    await this.getChannelById(dto.channelId);

    if (await this.isAdmin(dto.callerUserId, dto.channelId) === false)
      throw new ForbiddenException("Only admin can mute users");

    if (await this.isOwner(dto.mutedUserId, dto.channelId) === true)
      throw new ForbiddenException("Can't mute channel owner");

    const response: { isMuted: boolean, isSet: boolean, rowId: number } = await this.isMute({ channelId: dto.channelId, userId: dto.mutedUserId });
    if (response.isSet === true) {
      await this.prisma.mutedUser.delete({
        where: { id: response.rowId }
      })
    }

    await this.prisma.mutedUser.create({
      data: {
        userId: dto.mutedUserId,
        channelId: dto.channelId,
        mutedUntil: dto.mutedUntil,
      },
    })

  }

}

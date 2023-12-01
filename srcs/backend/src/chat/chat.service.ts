import { HttpException, HttpStatus, Injectable, NotFoundException, Inject, forwardRef, NotAcceptableException, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Channel, Message, User, ChannelType, MutedUser } from "@prisma/client";
import { ChatGateway } from "./chat.gateway";
import * as argon from 'argon2';
import { ForbiddenException } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { PairUserIdChannelId, muteDto } from "./dto/chat.dto";
import { MessageToStoreDto } from "./dto/chat.dto";
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
              private readonly userService: UsersService) { }

  async getAllConvFromId(id: number): Promise<number[]> {

    const user = await this.prisma.user.findUnique({
      where: { id, },
      include: { conversations: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
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
      throw new NotFoundException("Channel not found");

    const caller: User = await this.getUserById(callerId);
    if (!caller)
      throw new NotFoundException(`User with id ${callerId} not found`);

    const numberUsersInChannel: number = channel.participants.length;
    if (numberUsersInChannel === 2) {
      return (callerId === channel.participants[0].id ? channel.participants[1].username : channel.participants[0].username)
    }
    return channel.name;
  }

  async getChannelHeadersFromId(channelId: number, userId: number): Promise<ChannelLight> {
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
      throw new NotFoundException("Channel not found");
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

  async getBlockedUsersById(userId: number): Promise<number[]> {

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { blockedUsers: true }
    })

    if (!user)
      throw new ForbiddenException("User not found");

    return user.blockedUsers.map(user => user.id);
  }

  async getAllMessagesByChannelId(channelId: number, userId: number): Promise<Message[]> {

    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
      include: {
        messages: true, // Inclure les messages associés au canal
      },
    });

    if (!channel) {
      throw new NotFoundException("Channel not found");
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
    isUserMuted = await this.isMute({ userId: message.senderId, channelId: message.channelId });

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

  async getUsersFromChannelId(channelId: number): Promise<User[]> {
    const users = await this.prisma.channel.findUnique({
      where: { id: channelId },
    }).participants();

    if (!users)
      throw new NotFoundException("Users not found");

    return users;
  }

  async getUsernamesFromSubstring(substring: string): Promise<User[]> {

    const users: User[] = await this.prisma.user.findMany({
      where: {
        publicName: {
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
    try {
      await this.getUserById(channelInfo.ownerId);
      const channels = await this.prisma.channel.findMany();
      console.log("channel output ==");
      console.log(channels);
      if (!channels)
        throw new NotFoundException("Error getting channels");
      const existingChannelNames = channels.map(channel => channel.name);

      if (existingChannelNames.some(channelName => channelInfo.name === channelName)) {
        if (channelInfo.name)
          throw new NotAcceptableException("Channel already exist");
      }

      const participants: { id: number; }[] = channelInfo.participants.map(userId => ({ id: userId }));
      participants.push({ id: channelInfo.ownerId });

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
        throw new ServiceUnavailableException("Error creating new channel");
      return newChannel.id;
    } catch (errors) {
      throw errors;
    }
  }

  async isAdmin(userId: number, channelId: number): Promise<boolean> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: Number(channelId) },
      include: { admins: true },
    });

    if (!channel) {
      throw new NotFoundException("Channel not found");
    }
    return channel.admins.some((element) => element.id === userId);
  }

  async isOwner(userId: number, channelId: number): Promise<boolean> {
    const channel = await this.getChannelById(channelId);

    if (!channel) {
      throw new NotFoundException("Channel not found");
    }

    if (channel.ownerId === userId)
      return true;
    return false;
  }

  async getNumberUsersInChannel(channelId: number): Promise<number> {

    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        participants: {},
      }
    }
    );

    if (!channel) {
      throw new NotFoundException(`Channel not found`);
    }

    return (channel.participants.length);
  }

  async checkUsersCredentials(targetId: number, callerId: number, channelId: number, action: string): Promise<void> {

    const targetIsAdmin: boolean = await this.isAdmin(targetId, channelId);
    const callerIsAdmin: boolean = await this.isAdmin(callerId, channelId);
    const callerIsOwner: boolean = await this.isOwner(callerId, channelId);

    if (callerIsAdmin === false)
      throw new ForbiddenException(`Only admin can ${action}`);

    if (targetIsAdmin === true){
      if (callerIsOwner === false)
        throw new ForbiddenException(`Only owner can ${action} admin`);
      await this.prisma.channel.update({
        where: { id: channelId },
        data: {
          admins: {
            disconnect: { id: targetId },
          }
        }
      })
    }

  }

  async kickUserFromChannel(userId: number, channelId: number, callerId: number): Promise<boolean> {

    await this.getChannelById(channelId);

    await this.checkUsersCredentials(userId, callerId, channelId, "kick");

    const response: Channel = await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        participants: {
          disconnect: { id: userId }
        },
      },
    })

    if (!response)
      return false;

    return true;
  }

  async deleteAllMessagesInChannel(channelId: number): Promise<void> {
    await this.getChannelById(channelId);
    await this.prisma.message.deleteMany({
      where: { channelId, }
    });
  }

  async banUserFromChannel(userId: number, channelId: number, callerId: number): Promise<boolean> {

    await this.getChannelById(channelId);

    await this.checkUsersCredentials(userId, callerId, channelId, "ban");

    /*if (await this.isAdmin(userId, channelId) === true){
      if (await this.isOwner(callerId, channelId) === false)
        throw new ForbiddenException("You can't ban a channel Admin");
      await this.prisma.channel.update({
        where: { id: channelId },
        data: {
          admins: {
            disconnect: { id: userId },
          }
        }
      })
    } else {
        throw new ForbiddenException("Only admin/owner can ban");
    }*/

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

  async leaveChannel(userId: number, channelId: number, newOwnerId?: number): Promise<boolean> {

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
      throw new ForbiddenException("Admin can't leave channel");

    /*if (await this.getNumberUsersInChannel(channelId) <= 2) {
      await this.deleteAllMessagesInChannel(channelId);
      await this.prisma.channel.delete({
        where: { id: channelId },
      })
      await this.notifyClientChannelDeleted(channelId);
      return true;
    }*/

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

  async isUserIsInChannel(userId: number, channelId: number): Promise<boolean> {

    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { participants: true },
    });

    if (!channel)
      throw new NotFoundException("IsUserIsInChannel: user not found");

    return channel.participants.some((elem) => elem.id === userId);
  }

  async addAdminToChannel(inviterId: number, invitedId: number, channelId: number): Promise<boolean> {


    if (await this.isAdmin(inviterId, channelId) === false) {
      throw new ForbiddenException("Is not admin");
    }

    if (await this.isUserIsInChannel(invitedId, channelId) === false) {
      throw new NotFoundException("addAdminToChannel: user you want to add to admin is not in channel")
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
      throw new NotFoundException("addAdminToChannel: Channel not found");
    return true;
  }

  async removeAdminFromChannel(inviterId: number, invitedId: number, channelId: number): Promise<boolean> {

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

    if (await this.isUserIsInChannel(invitedId, channelId) === false) {
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

  async getUsernamesInChannelFromSubstring(channelId: number, substring: string, userId: number): Promise<User[]> {

    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { participants: true }
    })

    if (!channel) {
      throw new NotFoundException(`Channel with id ${channelId} not found`);
    }

    const caller: User | undefined = await this.userService.findUserWithId(userId);

    const users: User[] = channel.participants.filter((user) => {
      return user.publicName?.startsWith(substring)
    });

    const modifiedUsers = users.map(user => {
      // Remplace le contenu de hashPassword par une chaîne vide
      return { ...user, hashPassword: '' };
    });
    
    return modifiedUsers.filter(user => user.publicName !== caller.publicName);
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

  async addUserToChannel(userId: number, channelId: number): Promise<number> {

    if (await this.isUserIsBan(channelId, userId)){
      const user: User = await this.userService.findUserWithId(userId);
      throw new NotAcceptableException(`${user.publicName} is ban from this channel`);
    }

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
    const isExist = await this.prisma.channel.findFirst({
      where: { name: channelName },
    })
    if (!isExist)
      throw new NotFoundException("Channel not exist");
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

  async addUserToProtectedChannel(channelId: number, providedPassword: string, userId: number): Promise<void> {
    const channel = await this.getChannelById(channelId);
    if (!channel.password)
      throw new ForbiddenException('Channel password not found');
    const passwordMatch = await argon.verify(channel.password, providedPassword);
    if (!passwordMatch)
      throw new ForbiddenException('Incorrect channel password');
    await this.addUserToChannel(userId, channelId);
  }

  async getUserById(channelId: number): Promise<User> {

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
      throw new NotFoundException(`Channel not found`);
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

    if (callerId === targetId)
      throw new UnauthorizedException('Can\'t block yourself');

    await this.getUserById(targetId);
    await this.getUserById(callerId);

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
    if (channelType === "PASSWORD_PROTECTED" && (newPassword.length < 6 || newPassword.length > 22))
        throw new ForbiddenException("Channel password must be 6 to 22 characterss");
    if (channel.type === "PASSWORD_PROTECTED") {
      if (!channel.password)
        throw new NotAcceptableException('Impossible match');
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

    await this.checkUsersCredentials(dto.mutedUserId, dto.callerUserId, dto.channelId, "mute");

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

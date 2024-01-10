import { Socket } from 'socket.io-client';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface Message {
  id: number // id: 0
  senderId: number
  channelId: number
  content: string
  createdAt: Date
  messageType: string
}

interface isChannelNameConnected {
  isConnected: boolean;
  name: string | null;
}

enum ChannelType {
  PUBLIC,
  PRIVATE,
  PASSWORD_PROTECTED,
}

interface IisChannelExist {
  isExist: boolean,
  channelType: ChannelType,
  id: number,
}

const GetRequestOptions: RequestInit = {
  method: 'GET',
  credentials: 'include',
}

interface ErrorMessages {
  [key: number]: string;
}

export const handleHTTPErrors = (response: Response, customErrorMessages: ErrorMessages) => {
  if (!response.ok) {
    let messageError: string = "";
    switch (response.status) {
      case 400:
        messageError = "Bad request";
        break;
      case 401:
        messageError = "Unauthorized access";
        break;
      case 403:
        messageError = "Forbidden access";
        break;
      case 404:
        messageError = "Resource not found";
        break;
      case 406:
        messageError = "Request not acceptable";
        break;
      default: {
        messageError = "Server error";
      }
    }
    if (customErrorMessages[response.status])
      messageError += customErrorMessages[response.status];
    throw new Error(messageError);
  }
}

export const getMyUserId = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      credentials: 'include',
      method: 'GET',
    })
    if (!response.ok)
      return Promise.reject(await response.json());
    const user = await response.json();
    return user.id;
  } catch (error) {
    throw error;
  }
}

export const fetchUser = async (
  setChannelHeader: React.Dispatch<React.SetStateAction<Channel[]>>,
  userId: number,
  socket: Socket) => {
  setChannelHeader([]);

  try {

    const response = await fetch(`${API_BASE_URL}/api/chat/getAllConvFromId`, {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok)
      return (Promise.reject(await response.json()));

    const listChannelId = await response.json();

    const fetchChannelHeaders = listChannelId.map(async (id: string) => {
      const channelId = Number(id);
      const response = await fetch(`${API_BASE_URL}/api/chat/getChannelHeader?channelId=${channelId}`, GetRequestOptions);
      handleHTTPErrors(response, {});
      const header: Channel = await response.json();

      let channelInfo: isChannelNameConnected | null = {
        name: '',
        isConnected: false,
      };

      if (header.name === '') {
        const name: string | null = await getChannelName(channelId);
        if (name)
          header.name = name;
        channelInfo = await setHeaderNameWhenTwoUsers(id, userId, socket);
        if (!channelInfo)
          return null;
      }
      header.isConnected = channelInfo.isConnected;
      return header;
    });
    const channelHeaders = await Promise.all(fetchChannelHeaders);
    setChannelHeader(channelHeaders);
  } catch (error) {
    throw error;
  }
};

export const getNumberUsersInChannel = async (channelId: number): Promise<number> => {
  try {
    const response: Response = await fetch(`${API_BASE_URL}/api/chat/getNumberUsersInChannel?channelId=${channelId}`, GetRequestOptions);
    handleHTTPErrors(response, {});
    const numberUsersInChannel: number = await response.json();
    return numberUsersInChannel;
  } catch (error: any) {
    throw error;
  }
}

export const getChannelName = async (channelId: number): Promise<string | null> => {
  try {
    const response: Response = await fetch(`${API_BASE_URL}/api/chat/getChannelName?channelId=${channelId}`, GetRequestOptions);
    handleHTTPErrors(response, {});
    const channelName = await response.text();
    return channelName;
  } catch (error) {
    throw error;
  }
}

export const createChannel = async (
  channelName: string,
  password: string,
  participants: number[],
  channelType: string,
  setChannelHeader: React.Dispatch<React.SetStateAction<Channel[]>>,
  userId: number,
  socket: Socket,
): Promise<number> => {
  const channelToAdd = {
    name: channelName,
    password,
    ownerId: userId,
    participants,
    type: channelType,
  };

  try {

    const response = await fetch(`${API_BASE_URL}/api/chat/addChannelToUser`, {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(channelToAdd),
    });

    if (!response.ok) {
      return Promise.reject(await response.json());
    }
    await fetchUser(setChannelHeader, userId, socket);
    const channelId: number = await response.json();
    for (const userId of participants) {
      const data = {
        userId: userId,
        channelId,
      };
      socket.emit("notifySomeoneJoinChannel", data);
    }
    return channelId;
  } catch (error: any) {
    throw error;
  }
};

function compareUsersWithNumbers(users: User[], participants: number[]): boolean {

  if (users.length !== participants.length) {
    return false;
  }

  const userIds = users.map((user) => user.id);

  for (const userId of userIds) {
    if (!participants.includes(userId)) {
      return false;
    }
  }

  return true;
}


// Check if a channel between several users already exists
// if yes, return channelId
// if no, return -1
export const isChannelExist = async (participants: number[]): Promise<number> => {

  if (participants.length < 2)
    return -1;

  let channelList: number[] = [];

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/getAllConvFromId`, {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json", // Add appropriate headers if needed
      },
    });

    if (!response.ok) {
      Promise.reject(await response.json());
    }

    channelList = await response.json();
    for (const convId of channelList) {
      const response = await fetch(`${API_BASE_URL}/api/chat/getUsersFromChannelId?channelId=${convId}`, GetRequestOptions);
      handleHTTPErrors(response, {});
      const channelType: string = await getChannelType(convId);
      const userList = await response.json();
      if ((compareUsersWithNumbers(userList, participants) === true) && (channelType === "PRIVATE")) {
        return convId;
      }
    }
  } catch (error) {
    console.error('Erreur lors de la requête:', error);
  }

  return -1;
};

export function isChannelIsLive(channelId: number, userId: number, socket: Socket): Promise<boolean> {
  const data = {
    channelId,
    userId
  }
  return new Promise((resolve) => {
    socket.emit('isChannelLive', data, (response: boolean) => {
      resolve(response);
    });
  });
}

export const setHeaderNameWhenTwoUsers = async (channelId: string, userId: number, socket: Socket): Promise<isChannelNameConnected | null> => {
  const channelInfo: isChannelNameConnected = {
    name: '',
    isConnected: false,
  };
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/getUsersFromChannelId?channelId=${channelId}`, GetRequestOptions);
    handleHTTPErrors(response, {});
    const users: User[] = await response.json();
    if (!users)
      throw new Error("Error fetching database");
    if (users.length < 2) {
      return channelInfo;
    }
    var userIndex: number = -1;

    userId === users[0].id ? userIndex = 1 : userIndex = 0;

    if (users[userIndex].publicName) {
      channelInfo.name = users[userIndex].publicName;
    }
    return channelInfo;
  } catch (errors) {
    throw errors;
  }
}

export const leaveChannel = async (
  userId: number,
  channelId: number,
  setChannelHeader: React.Dispatch<React.SetStateAction<Channel[]>>,
  socket: Socket,
  newOwnerId?: number): Promise<boolean> => {

  try {
    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify({ channelId, newOwnerId }),
    };
    const response = await fetch(`${API_BASE_URL}/api/chat/leaveChannel`, requestOptions);
    handleHTTPErrors(response, {});
    if (!response)
      return false;
    await fetchUser(setChannelHeader, userId, socket);
    return true;
  } catch (errors) {
    throw errors;
  }
}

export const getUsernamesBySubstring = async (userIdCaller: number, substring: string): Promise<User[]> => {
  try {
    const cleanSubstring: string = encodeURIComponent(substring);
    const response = await fetch(`${API_BASE_URL}/api/chat/getUsernamesFromSubstring?substring=${cleanSubstring}`, GetRequestOptions);
    handleHTTPErrors(response, {});
    const listUsers: User[] = await response.json();
    const filteredListUsers = listUsers.filter((user: User) => user.id !== userIdCaller);
    return filteredListUsers;
  } catch (errors) {
    throw errors;
  }
}

export const getUsernamesInChannelFromSubstring = async (
  channelId: number,
  substringLogin: string
): Promise<User[] | null> => {

  const cleanSubstring: string = encodeURIComponent(substringLogin);

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/getUsernamesInChannelFromSubstring?channelId=${channelId}&substring=${cleanSubstring}`, GetRequestOptions);
    handleHTTPErrors(response, {});
    const users: User[] = await response.json();
    return users;
  } catch (errors) {
    throw errors;
  }
}

export const banUserList = async (userList: User[], channelId: number, socket: Socket): Promise<void> => {
  try {
    for (const user of userList) {
      const targetId: number = user.id;
      const response: Response = await fetch(`${API_BASE_URL}/api/chat/banUserFromChannel`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetId, channelId })
      });
      if (!response.ok) {
        console.log("promise rejected");
        return Promise.reject(await response.json());
      }
      if (response.status === 201) {
        console.log("statut 201");
        const data = {
          channelId,
          userId: user.id,
        }
        socket.emit("notifySomeoneLeaveChannel", data);
      }
    }
  } catch (error) {
    throw error;
  }
};

export const kickUserList = async (userList: User[], channelId: number, socket: Socket) => {
  for (const user of userList) {
    try {
      const targetId: number = user.id;
      const response: Response = await fetch(`${API_BASE_URL}/api/chat/kickUserFromChannel`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetId, channelId })
      });
      if (response.status === 201) {
        console.log(`notify that ${user.id} is kicked out of channel`);
        const data = {
          channelId,
          userId: user.id
        }
        socket.emit("notifySomeoneLeaveChannel", data);
      }
      if (!response.ok)
        return Promise.reject(await response.json());
    } catch (errors) {
      throw errors;
    }
  }
};

export const fetchChannelUsers = async (channelId: number): Promise<User[]> => {

  try {
    const response: Response = await fetch(`${API_BASE_URL}/api/chat/getUsersFromChannelId?channelId=${channelId}`, GetRequestOptions);
    handleHTTPErrors(response, {});
    const users: User[] = await response.json();
    return users;
  } catch (errors) {
    throw errors;
  }
}

export const fetchChannelAdmins = async (channelId: number): Promise<User[]> => {

  try {

    const response: Response = await fetch(`${API_BASE_URL}/api/chat/getAdmins?channelId=${channelId}`, GetRequestOptions);
    if (!response.ok) {
      throw new Error("Error fetching data");
    }
    const admins: User[] = await response.json();

    return admins;

  } catch (error) {
    throw error;
  }
}

export const fetchUserAdminTable = async (channelId: number): Promise<{ user: User, isAdmin: boolean, updated: boolean }[]> => {

  try {

    const users: User[] = await fetchChannelUsers(channelId);
    const admins: User[] = await fetchChannelAdmins(channelId);

    const userAdminTable: { user: User, isAdmin: boolean, updated: boolean }[] = users.map((user) => ({
      user,
      isAdmin: admins.some((admin) => admin.id === user.id),
      updated: false,
    }))

    return userAdminTable;
  } catch (error) {
    throw error;
  }
}

export const manageAdminsToChannel = async (userList: { user: User, isAdmin: boolean }[], channelId: number, inviterId: number): Promise<void> => {
  try {
    for (const user of userList) {
      const invitedId: number = user.user.id;
      if (user.isAdmin === true) {
        const response = await fetch(`${API_BASE_URL}/api/chat/addAdminToChannel`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({ inviterId, invitedId, channelId })
        });
        handleHTTPErrors(response, {});
      } else {
        const response = await fetch(`${API_BASE_URL}/api/chat/removeAdminFromChannel`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({ inviterId, invitedId, channelId })
        });
        handleHTTPErrors(response, {});
      }
    }
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

export const addUserIdToChannel = async (channelId: number, userId: number): Promise<number> => {
  try {
    const requestOptions: RequestInit = {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, channelId })
    };
    const response = await fetch(`${API_BASE_URL}/api/chat/addUserToChannel`, requestOptions);
    if (!response.ok) {
      return Promise.reject(await response.json());
    }
    const channelIdAdded: number = await response.json();
    return channelIdAdded;
  } catch (error) {
    throw error;
  }
}

export const addUserListToChannel = async (userList: User[], channelId: number, socket: Socket): Promise<Response[]> => {
  try {
    const responses: Promise<Response>[] = userList.map((user) => {
      const userId: number = user.id;
      return fetch(`${API_BASE_URL}/api/chat/addUserToChannel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId, channelId })
      });
    });

    return Promise.all(responses)
      .then(async (responses) => {
        const errors = [];
        let index = 0;

        for (const response of responses) {
          if (response.ok) {
            const data = {
              userId: userList[index].id,
              channelId,
            };
            socket.emit("notifySomeoneJoinChannel", data);
          } else {
            errors.push(await response.json());
          }
          index++;
        }

        for (const error of errors) {
          return Promise.reject(error);
        }

        return responses;
      })
      .catch((error) => {
        throw error;
      });
  } catch (error) {
    throw error;
  }
};

export const isUserIsBan = async (channelId: number, userId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/isUserIsBan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ channelId, userId })
    });
    if (!response.ok)
      return (Promise.reject(await response.json()));
    return await response.json();
  } catch (error) {
    console.log(error);
  }
  return false;
}

export const joinProtectedChannel = async (channelId: number, userId: number, password: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/addUserToProtectedChannel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ password, userId, channelId })
    });
    if (!response.ok)
      return (Promise.reject(await response.json()));
    return true;
  } catch (error: any) {
    return false;
  }
}

export const joinChannel = async (channel: IisChannelExist, userId: number): Promise<{ channelType: ChannelType, channelId: number }> => {
  try {
    let channelIdJoined: number = -1;
    switch (channel.channelType.toString()) {
      case "PUBLIC":
        channelIdJoined = await addUserIdToChannel(channel.id, userId); // check if we need to protect this API call
        break;
      case "PRIVATE":
        break;
      case "PASSWORD_PROTECTED":
        break;
    }
    return { channelType: channel.channelType, channelId: channelIdJoined };
  } catch (error) {
    throw error;
  }
}

export const isUserIsBlockedBy = async (targetId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/isUserIsBlockedBy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: targetId }),
      credentials: "include",
    });

    if (!response.ok) {
      Promise.reject(await response.json());
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur :', error);
    throw error;
  }
}

export const blockUser = async (targetId: number) => {
  fetch(`${API_BASE_URL}/api/chat/blockUser`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId: targetId }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur réseau.');
      }
    })
    .then(data => {
      console.log('Réponse du serveur :', data);
    })
    .catch(error => {
      console.error('Erreur :', error);
    });
}

export const unblockUser = async (targetId: number) => {
  fetch(`${API_BASE_URL}/api/chat/unblockUser`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId: targetId })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur réseau.');
      }
    })
    .catch(error => {
      console.error('Erreur :', error);
    });
}

export const fetchConversation = async (userId: number, channelId: number, addMsgToFetchedConversation: (message: Message) => void) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/getAllMessagesByChannelId?channelId=${channelId}`, GetRequestOptions);
    handleHTTPErrors(response, {});
    const messageList = await response.json();
    if (!messageList)
      return;
    messageList.map((message: Message) => {
      userId === message.senderId ? message.messageType = "MessageTo" : message.messageType = "MessageFrom";
      addMsgToFetchedConversation(message);
      return null;
    })
  } catch (error) {
    throw error;
  }
}

export const manageChannelPassword = async (channelId: number, channelType: string, actualPassword: string, newPassword: string) => {
  try {
    const response: Response = await fetch(`${API_BASE_URL}/api/chat/manageChannelPassword`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channelId, channelType, actualPassword, newPassword })
    });
    if (!response.ok)
      return (Promise.reject(await response.json()));
    const customErrorMessages: ErrorMessages = {
      400: ": Password length is 6 to 22 characters",
      403: ": Wrong password",
    };
    handleHTTPErrors(response, customErrorMessages);
  } catch (error) {
    throw error;
  }
}

export const manageChannelType = async (channelId: number, channelType: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/manageChannelType`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ channelId, channelType })
    });
    const customErrorMessages: ErrorMessages = {
      403: "",
      404: ": channel",
    };
    handleHTTPErrors(response, customErrorMessages);
  } catch (error) {
    throw error;
  }
}

export const getChannelType = async (channelId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/getChannelType`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json' // Définissez le type de contenu JSON si nécessaire
      },
      body: JSON.stringify({ channelId })
    });
    handleHTTPErrors(response, {});
    const channelType: string = await response.text();
    return channelType;
  } catch (error) {
    throw error;
  }
}

export const isOwner = async (channelId: number, userId: number): Promise<boolean> => {
  try {
    const response: Response = await fetch(`${API_BASE_URL}/api/chat/isOwner?channelId=${channelId}&userId=${userId}`, GetRequestOptions);
    handleHTTPErrors(response, {});
    const isOwner = await response.json();
    return isOwner;
  } catch (error) {
    throw error;
  }
}

export const mute = async (mutedUserId: number, mutedUntilString: string, channelId: number) => {
  try {
    const mutedUntil: Date = new Date(mutedUntilString);
    const response = await fetch(`${API_BASE_URL}/api/chat/mute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // Définissez le type de contenu JSON si nécessaire
      },
      credentials: 'include',
      body: JSON.stringify({ mutedUserId, channelId, mutedUntil })
    });
    handleHTTPErrors(response, {});
    console.log("mute called");
  } catch (errors) {
    throw errors;
  }
}

export const getUsername = async (userId: number): Promise<string> => {
  try {
    const response: Response = await fetch(`${API_BASE_URL}/api/users/getPublicName?userId=${userId}`, GetRequestOptions);
    handleHTTPErrors(response, {});
    const publicName: string = await response.text();
    return publicName;
  } catch (errors) {
    throw errors;
  }
}
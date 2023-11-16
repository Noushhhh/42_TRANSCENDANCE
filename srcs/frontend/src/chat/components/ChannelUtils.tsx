import axios from 'axios';
import { Socket } from 'socket.io-client';
import { PairUserIdChannelId } from '../../../../backend/src/chat/dto/chat.dto';
import { ErrorSharp } from '@mui/icons-material';

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

interface isChannelExist {
  isExist: boolean,
  channelType: ChannelType,
  id: number,
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
  const response = await fetch('http://localhost:4000/api/users/me', {
    credentials: 'include',
    method: 'GET',
  })
  const user = await response.json();
  return user.id;
}

export const fetchUser = async (
  setChannelHeader: React.Dispatch<React.SetStateAction<Channel[]>>,
  userId: number,
  socket: Socket) => {
  setChannelHeader([]);

  try {

    const response = await fetch(`http://localhost:4000/api/chat/getAllConvFromId`, {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json", // Add appropriate headers if needed
      },
      body: JSON.stringify({ userId }), // Include the data you want to send in the request body
    });

    const listChannelId = await response.json();

    const fetchChannelHeaders = listChannelId.map(async (id: string) => {
      const channelId = Number(id);
      const response = await fetch(`http://localhost:4000/api/chat/getChannelHeader?channelId=${channelId}&userId=${userId}`);
      handleHTTPErrors(response, {});
      const header: Channel = await response.json();

      let channelInfo: isChannelNameConnected | null = {
        name: '',
        isConnected: false,
      };

      if (header.name === '') {
        channelInfo = await setHeaderNameWhenTwoUsers(id, userId, socket);
        if (!channelInfo)
          return null;
        if (channelInfo.name)
          header.name = channelInfo.name;
        else 
          header.name = "";
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
    const response: Response = await fetch(`http://localhost:4000/api/chat/getNumberUsersInChannel?channelId=${channelId}`);
    handleHTTPErrors(response, {});
    const numberUsersInChannel: number = await response.json();
    return numberUsersInChannel;
  } catch (error: any) {
    throw error;
  }
}

export const getChannelName = async (channelId: number, userId: number): Promise<string> => {
  try {
    const response: Response = await fetch(`http://localhost:4000/api/chat/getChannelName?channelId=${channelId}&userId=${userId}`);
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

    console.log("add channel called with: ", channelToAdd.name)

    const response = await fetch(`http://localhost:4000/api/chat/addChannelToUser`, {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(channelToAdd),
    });

    if (!response.ok){
      return Promise.reject(await response.json());
    }
    await fetchUser(setChannelHeader, userId, socket);
    const channelId: number = await response.json();
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
    // get all the conversation of a user
    let userId: number = participants[0];
    const response = await fetch(`http://localhost:4000/api/chat/getAllConvFromId`, {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json", // Add appropriate headers if needed
      },
      body: JSON.stringify({ userId }), // Include the data you want to send in the request body
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des données');
    }

    channelList = await response.json();
    for (const convId of channelList) {
      const response = await fetch(`http://localhost:4000/api/chat/getUsersFromChannelId?channelId=${convId}`);
      handleHTTPErrors(response, {});
      const userList = await response.json();
      if (compareUsersWithNumbers(userList, participants) === true) {
        return convId;
      }
    }
  } catch (error) {
    console.error('Erreur lors de la requête:', error);
  }

  return -1;
};

export function isUserConnected(userId: number, socket: Socket): Promise<boolean> {
  return new Promise((resolve) => {
    socket.emit('isUserConnected', userId, (response: boolean) => {
      resolve(response);
    });
  });
}

export const isChannelNameExist = async (updatedChannelName: string): Promise<void> => {
  try {
    const response = await fetch('http://localhost:4000/api/chat/isChannelNameExist', );

  } catch (error) {

  }

}

export const setHeaderNameWhenTwoUsers = async (channelId: string, userId: number, socket: Socket): Promise<isChannelNameConnected | null> => {
  const channelInfo: isChannelNameConnected = {
    name: '',
    isConnected: false,
  };
  try {
    const response = await fetch(`http://localhost:4000/api/chat/getUsersFromChannelId?channelId=${channelId}`);
    handleHTTPErrors(response, {});
    const users: User[] = await response.json();
    if (!users)
      throw new Error("Error fetching database");
    if (users.length < 2) {
      return channelInfo;
    }
    var userIndex: number = -1;
    
    userId === users[0].id ? userIndex = 1 : userIndex = 0;

    await isUserConnected(users[userIndex].id, socket)
    .then((response: boolean) => {
        channelInfo.isConnected = response;
      })
      .catch((error) => {
        throw error;
      });
      if (users[userIndex].publicName)
        channelInfo.name = users[userIndex].publicName;
      return channelInfo;
  } catch (errors){
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
      body: JSON.stringify({ userId, channelId, newOwnerId }),
  };
  const response = await fetch(`http://localhost:4000/api/chat/leaveChannel`, requestOptions);
  handleHTTPErrors(response, {});
  if (!response)
    return false;
  await fetchUser(setChannelHeader, userId, socket); 
  return true;
} catch (errors){
  throw errors;
}
}

export const getUsernamesBySubstring = async (userIdCaller: number, substring: string): Promise<User[]> => {
  try {
    const cleanSubstring: string = encodeURIComponent(substring);
    const response = await fetch(`http://localhost:4000/api/chat/getUsernamesFromSubstring?substring=${cleanSubstring}`);
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
  substringLogin: string,
  userId: number
): Promise<User[] | null> => {

  const cleanSubstring: string = encodeURIComponent(substringLogin);

  try {
    const response = await fetch(`http://localhost:4000/api/chat/getUsernamesInChannelFromSubstring?channelId=${channelId}&substring=${cleanSubstring}&userId=${userId}`);
    handleHTTPErrors(response, {});
    const users: User[] = await response.json();
    console.log(users);
    return users;
  } catch (errors) {
    throw errors;
  }
}

export const banUserList = async (userList: User[], channelId: number, callerId: number, socket: Socket): Promise<void> => {
  try {
    for (const user of userList) {
      const userId: number = user.id;
      const response: Response = await fetch(`http://localhost:4000/api/chat/banUserFromChannel`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, channelId, callerId })
      });
      if (!response.ok){
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
    console.log("error handler banuserlist");
    throw error;
  }
};

export const kickUserList = async (userList: User[], channelId: number, callerId: number, socket: Socket) => {
    for (const user of userList) {
      try {
        const userId: number = user.id;
        const response: Response = await fetch(`http://localhost:4000/api/chat/kickUserFromChannel`, {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, channelId, callerId })
        });
        if (response.status === 201) {
          const data = {
            channelId,
            userId: user.id
          }
          socket.emit("notifySomeoneLeaveChannel", data);
        }
        if (!response.ok)
          return Promise.reject(await response.json());
      } catch (errors){
        throw errors;
      }
    }
  };

export const fetchChannelUsers = async (channelId: number): Promise<User[]> => {

  try {
    const response: Response = await fetch(`http://localhost:4000/api/chat/getUsersFromChannelId?channelId=${channelId}`);
    handleHTTPErrors(response, {});
    const users: User[] = await response.json();
    return users;
  } catch (errors) {
    throw errors;
  }
}

export const fetchChannelAdmins = async (channelId: number): Promise<User[]> => {

  try {

    const response: Response = await fetch(`http://localhost:4000/api/chat/getAdmins?channelId=${channelId}`);
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
    throw new Error("Error fetching data");
  }
}

export const manageAdminsToChannel = async (userList: { user: User, isAdmin: boolean }[], channelId: number, inviterId: number): Promise<void> => {
  try {
    for (const user of userList) {
      const invitedId: number = user.user.id;
      const response: Response = new Response();
      if (user.isAdmin === true) {
        const response = await fetch(`http://localhost:4000/api/chat/addAdminToChannel`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify( { inviterId, invitedId, channelId } )
        });
        handleHTTPErrors(response, {});
      } else {
        const response = await fetch(`http://localhost:4000/api/chat/removeAdminFromChannel`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify( { inviterId, invitedId, channelId } )
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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, channelId })
    };
    const response = await fetch(`http://localhost:4000/api/chat/addUserToChannel`, requestOptions);
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

  const responses: Promise<Response>[] = userList.map((user) => {
    const userId: number = user.id;
    return fetch(`http://localhost:4000/api/chat/addUserToChannel`, {
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

    for (const error of errors){
      return Promise.reject(error);
    }

    return responses;
  })
  .catch((error) => {
    throw error;
  });
};

export const isUserIsBan = async (channelId: number, userId: number): Promise<boolean> => {
  try {
    const response = await axios.post("http://localhost:4000/api/chat/isUserIsBan", { channelId, userId });
    return response.data;
  } catch (error) {
    console.log(error);
  }
  return false;
}

export const joinProtectedChannel = async (channelId: number, userId: number, password: string): Promise<boolean> => {
  try {
    const response = await axios.post('http://localhost:4000/api/chat/addUserToProtectedChannel', { password, userId, channelId });
    console.log(response);
    return true;
  } catch (error: any) {
    return false;
  }
}

export const joinChannel = async (channel: isChannelExist, userId: number): Promise<{ channelType: ChannelType, channelId: number }> => {
  try {
    let channelIdJoined: number = -1;
    switch (channel.channelType.toString()) {
      case "PUBLIC":
        console.log('is public');
        channelIdJoined = await addUserIdToChannel(channel.id, userId); // check if we need to protect this API call
        break;
      case "PRIVATE":
        break;
      case "PASSWORD_PROTECTED":
        break;
    }
    return { channelType: channel.channelType, channelId: channelIdJoined };
  } catch (error) {
    console.log("case of error join channel");
    throw error;
  }
}

export const isUserIsBlockedBy = async (callerId: number, targetId: number): Promise<boolean> => {
  try {
    const response = await fetch("http://localhost:4000/api/chat/isUserIsBlockedBy", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ callerId, targetId })
    });

    if (!response.ok) {
      throw new Error('Erreur réseau.');
    }

    const data = await response.json(); // Attendre la conversion de la réponse en JSON
    console.log('Réponse du serveur :', data);

    return data; // Retourner la réponse obtenue depuis fetch
  } catch (error) {
    console.error('Erreur :', error);
    throw error; // Lancer l'erreur pour que l'appelant puisse la gérer
  }
}

export const blockUser = async (callerId: number, targetId: number) => {
  fetch("http://localhost:4000/api/chat/blockUser", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' // Définissez le type de contenu JSON si nécessaire
    },
    body: JSON.stringify({ callerId, targetId }) // Convertit l'objet JavaScript en JSON
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

export const unblockUser = async (callerId: number, targetId: number) => {
  fetch("http://localhost:4000/api/chat/unblockUser", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' // Définissez le type de contenu JSON si nécessaire
    },
    body: JSON.stringify({ callerId, targetId }) // Convertit l'objet JavaScript en JSON
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

/*export const getBlockedUsersById = async (userId: number): Promise<number[]> => {
  try {
    const response = await fetch(`http://localhost:4000/api/chat/getBlockedUsersById`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json' // Définissez le type de contenu JSON si nécessaire
      },
      body: JSON.stringify({ userId })
    });
    if (!response) {
      throw new Error('Error fetching data');
    }
    const blockedUsers: number[] = await response.json();
    return blockedUsers;
  } catch (error) {
    throw error;
  }
}*/

export const fetchConversation = async (userId: number, channelId: number, addMsgToFetchedConversation: (message: Message) => void) => {
  try {
    const response = await fetch(`http://localhost:4000/api/chat/getAllMessagesByChannelId?channelId=${channelId}&userId=${userId}`);
    handleHTTPErrors(response, {});
    const messageList = await response.json();
    if (!messageList)
      return;
    messageList.map((message: Message) => {
      userId === message.senderId ? message.messageType = "MessageTo" : message.messageType = "MessageFrom";
      addMsgToFetchedConversation(message)
    })
  } catch (error) {
    throw error;
  }
}

export const manageChannelPassword = async (channelId: number, channelType: string, actualPassword: string, newPassword: string) => {
  try {
    const response: Response = await fetch(`http://localhost:4000/api/chat/manageChannelPassword`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channelId, channelType, actualPassword, newPassword })
    });
    const customErrorMessages: ErrorMessages = {
      400: ": Bad input",
      403: ": Wrong password",
    };
    handleHTTPErrors(response, customErrorMessages);
  } catch (error) {
    throw error;
  }
}

export const manageChannelType = async (channelId: number, channelType: string) => {
  try {
    const response = await fetch(`http://localhost:4000/api/chat/manageChannelType`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json' // Définissez le type de contenu JSON si nécessaire
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
    const response = await fetch(`http://localhost:4000/api/chat/getChannelType`, {
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
    console.log("is owner called");
    const response: Response = await fetch(`http://localhost:4000/api/chat/isOwner?channelId=${channelId}&userId=${userId}`);
    handleHTTPErrors(response, {});
    const isOwner = await response.json();
    console.log(isOwner);
    return isOwner;
  } catch (error) {
    throw error;
  }
}

export const mute = async (mutedUserId: number, callerUserId: number, mutedUntilString: string, channelId: number) => {
  try {
    const mutedUntil: Date = new Date(mutedUntilString);
    const response = await fetch(`http://localhost:4000/api/chat/mute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // Définissez le type de contenu JSON si nécessaire
      },
      credentials: 'include',
      body: JSON.stringify({ mutedUserId, callerUserId, channelId, mutedUntil })
    });
    handleHTTPErrors(response, {});
    console.log("mute called");
  } catch (errors) {
    throw errors;
  }
}

export const getUsername = async (userId: number): Promise<string> => {
  try {
    const response: Response = await fetch(`http://localhost:4000/api/users/getUsernameWithId?userId=${userId}`);
    handleHTTPErrors(response, {});
    const username: string = await response.text();
    return username;
  } catch (errors){
    throw errors;
  }
}
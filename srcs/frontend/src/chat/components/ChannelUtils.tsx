import axios from 'axios';
import { Socket } from 'socket.io-client';
import { PairUserIdChannelId } from '../../../../backend/src/chat/dto/chat.dto';

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
  name: string;
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
    if (response.status === 400){
      console.log("0 fetchUser");
      return;
    }

    const listChannelId = await response.json();

    const fetchChannelHeaders = listChannelId.map(async (id: string) => {
      const channelId = Number(id);
      const response = await fetch(`http://localhost:4000/api/chat/getChannelHeader`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json", // Add appropriate headers if needed
        },
        body: JSON.stringify({ channelId, userId }), // Include the data you want to send in the request body
      }
      );
      console.log("1 fetchUser");
      const header: Channel = await response.json();

      let channelInfo: isChannelNameConnected | null = {
        name: '',
        isConnected: false,
      };

      if (header.name === '') {
        channelInfo = await setHeaderNameWhenTwoUsers(id, userId, socket);
        if (!channelInfo)
          return null;
        header.name = channelInfo.name;
      }
      header.isConnected = channelInfo.isConnected;
      console.log("5 fetchUser");
      return header;
    });
    console.log("6 fetchUser");
    const channelHeaders = await Promise.all(fetchChannelHeaders);
    console.log("7 fetchUser");
    setChannelHeader(channelHeaders);
    } catch (error) {
    console.log("error in fetchUser");
  }
};

export const getNumberUsersInChannel = async (channelId: number): Promise<number> => {
  try {
    const response: Response = await fetch(`http://localhost:4000/api/chat/getNumberUsersInChannel/${channelId}`);
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
        "Content-Type": "application/json", // Add appropriate headers if needed
      },
      body: JSON.stringify(channelToAdd), // Include the data you want to send in the request body
    });

    if (!response.ok)
      throw new Error("Error creating channel");
    if (response.status === 406)
      throw new Error("Channel name already exist");
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

  // Create an array of user IDs from the users array
  const userIds = users.map((user) => user.id);

  // Check if all user IDs are present in the participants array
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

    if (!response) {
      throw new Error('Erreur lors de la récupération des données');
    }

    console.log(response);
    channelList = await response.json();
    for (const convId of channelList) {
      const response = await fetch(`http://localhost:4000/api/chat/getUsersFromChannelId/${convId}`);
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

export const setHeaderNameWhenTwoUsers = async (channelId: string, userId: number, socket: Socket): Promise<isChannelNameConnected | null> => {
  const channelInfo: isChannelNameConnected = {
    name: '',
    isConnected: false,
  };

  const response = await fetch(`http://localhost:4000/api/chat/getUsersFromChannelId/${channelId}`);
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
      // Gérer les erreurs, si nécessaire
    });
  channelInfo.name = users[userIndex].username;
  return channelInfo;
}

export const kickUserFromChannel = async (
  userId: number,
  channelId: number,
  setChannelHeader: React.Dispatch<React.SetStateAction<Channel[]>>,
  socket: Socket,
  callerId: number): Promise<boolean> => {

  if (isNaN(channelId) || channelId <= 0 || isNaN(userId) || userId <= 0 || isNaN(callerId) || callerId <= 0) {
    throw new Error("Invalid parameters");
  }

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Add appropriate headers if needed
    },
    body: JSON.stringify({ userId, channelId }), // Include the data you want to send in the request body
  };

  const response = await fetch(`http://localhost:4000/api/chat/kickUserFromChannel/${userId}/${channelId}/${callerId}`, requestOptions);
  if (!response)
    return false;

  if (response.status === 403) {
    console.log("acces refuse :", response.statusText);
  }

  await fetchUser(setChannelHeader, userId, socket);
  return true;
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

  if (isNaN(userIdCaller) || userIdCaller <= 0)
    throw new Error("userId is NaN");

  const cleanSubstring: string = encodeURIComponent(substring);

  try {
    const response = await fetch(`http://localhost:4000/api/chat/getLoginsFromSubstring/${cleanSubstring}`);
    const listUsers: User[] = await response.json();
    const filteredListUsers = listUsers.filter((user: User) => user.id !== userIdCaller);
    return filteredListUsers;
  } catch (error) {
    throw new Error("Error fetching data");
  }
}

export const getUsernamesInChannelFromSubstring = async (
  channelId: number,
  substringLogin: string,
  userId: number
): Promise<User[] | null> => {

  if (isNaN(channelId) || channelId <= 0) {
    throw new Error("Invalid channelId");
  }

  const cleanSubstring: string = encodeURIComponent(substringLogin);

  try {
    const response = await fetch(`http://localhost:4000/api/chat/getLoginsInChannelFromSubstring/${channelId}/${cleanSubstring}/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const users: User[] = await response.json();
    return users;
  } catch (error) {
    throw new Error("Failed to fetch data");
  }
}

export const banUserList = async (userList: User[], channelId: number, callerId: number, socket: Socket): Promise<void> => {
  try {
    const requestOptions: RequestInit = {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response: Response = await fetch(`http://localhost:4000/api/chat/getNumberUsersInChannel/${channelId}`);

    const numberUsers: number = await response.json();
    if (numberUsers === 2 && userList[0]) {
      const response: Response = await fetch(`http://localhost:4000/api/chat/banUserFromChannel/${userList[0].id}/${channelId}/${callerId}`, requestOptions);
      if (response.status === 201) {
        console.log(`userId ${userList[0].id} ban of ${channelId}`);
        const data = {
          channelId,
          userId: userList[0].id,
        }
        socket.emit("notifySomeoneLeaveChannel", data);
      }
    }

    for (const user of userList) {
      const response: Response = await fetch(`http://localhost:4000/api/chat/banUserFromChannel/${user.id}/${channelId}/${callerId}`, requestOptions);
      if (response.status === 403) {
        throw new Error("Action disallowed (you are not admin)");
      }
      else if (response.status === 406) {
        throw new Error("You can't ban a channel Admin");
      } else if (response.status === 201) {
        const data = {
          channelId,
          userId: user.id,
        }
        socket.emit("notifySomeoneLeaveChannel", data);
        console.log(`userId ${user.id} ban of ${channelId}`);
      }
    }

  } catch (error: any) {
    console.log("ban user list called error");
    throw error;
  }
};

export const kickUserList = async (userList: User[], channelId: number, callerId: number, socket: Socket) => {
  try {
    console.log('kick user is called');

    const requestOptions: RequestInit = {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
    };

    for (const user of userList) {
      const response: Response = await fetch(`http://localhost:4000/api/chat/kickUserFromChannel/${user.id}/${channelId}/${callerId}`, requestOptions);
      if (response.status === 403) {
        throw new Error("Action disallowed (you are not admin)");
      }
      else if (response.status === 406) {
        throw new Error("You can't kick a channel Admin");
      } else if (response.status === 201) {
        const data = {
          channelId,
          userId: user.id
        }
        socket.emit("notifySomeoneLeaveChannel", data);
      }
    }

  } catch (error: any) {
    throw error;
  }
};

export const fetchChannelUsers = async (channelId: number): Promise<User[]> => {

  try {

    const response: Response = await fetch(`http://localhost:4000/api/chat/getUsersFromChannelId/${channelId}`);
    if (!response.ok) {
      throw new Error("Error fetching data");
    }
    const users: User[] = await response.json();

    return users;

  } catch (error) {
    throw new Error("Error fetching data");
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
    throw new Error("Error fetching data");
  }
}

export const fetchUserAdminTable = async (channelId: number): Promise<{ user: User, isAdmin: boolean }[]> => {

  try {

    const users: User[] = await fetchChannelUsers(channelId);
    const admins: User[] = await fetchChannelAdmins(channelId);

    const userAdminTable: { user: User, isAdmin: boolean }[] = users.map((user) => ({
      user,
      isAdmin: admins.some((admin) => admin.id === user.id)
    }))

    return userAdminTable;

  } catch (error) {
    throw new Error("Error fetching data");
  }
}

export const manageAdminsToChannel = async (userList: { user: User, isAdmin: boolean }[], channelId: number, inviterId: number): Promise<void> => {

  try {

    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
    };

    for (const user of userList) {
      const response: Response = new Response();
      if (user.isAdmin === true) {
        const response = await fetch(`http://localhost:4000/api/chat/addAdminToChannel/${inviterId}/${user.user.id}/${channelId}`, requestOptions);
      } else {
        const response = await fetch(`http://localhost:4000/api/chat/removeAdminFromChannel/${inviterId}/${user.user.id}/${channelId}`, requestOptions);
      }
    }

  } catch (error: any) {
    if (error.status === 403)
      throw new Error("Action disallowed (you are not admin)");
    throw new Error("Error updating administrators");
  }

}

export const addUserIdToChannel = async (channelId: number, userId: number): Promise<number> => {
  try {
    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch(`http://localhost:4000/api/chat/addUserToChannel/${userId}/${channelId}`, requestOptions);
    if (!response.ok) {
      if (response.status === 406) {
        return Promise.reject(new Error("You are banned from this channel"));
      }
      if (response.status === 404) {
        return Promise.reject(new Error("Channel not found"));
      }
      throw new Error("Error adding user to channel");
    }
    const channelIdAdded: number = await response.json();
    return channelIdAdded;
  } catch (error) {
    throw error;
  }
}

export const addUserListToChannel = async (userList: User[], channelId: number, socket: Socket): Promise<Response[]> => {
  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const errorMessages: ErrorMessages = {
    406: "Ban users can't be added",
    404: "User not found",
    403: "Forbidden action",
  };

  // Créez un tableau de promesses pour les réponses.
  const responses: Promise<Response>[] = userList.map((user) => {
    return fetch(`http://localhost:4000/api/chat/addUserToChannel/${user.id}/${channelId}`, requestOptions);
  });

  // Utilisez Promise.all pour attendre que toutes les promesses se terminent.
  return Promise.all(responses)
    .then((responses) => {
      // Traitez les réponses ici.
      const errors = responses.filter((response) => response.status !== 201);
      if (errors.length > 0) {
        // S'il y a des erreurs, gérer-les et renvoyer une erreur si nécessaire.
        const errorMessagesList = errors.map((error) => {
          const userId = userList[responses.indexOf(error)].id;
          const errorMessage = errorMessages[error.status] || "Unknown error";
          return (`${errorMessage}`);
        });
        if (errorMessagesList.length > 0) {
          throw new Error(errorMessagesList[0]);
        }
      }

      // Si tout se passe bien, émettez un événement avec socket.
      userList.forEach((user) => {
        const data = {
          userId: user.id,
          channelId,
        };
        socket.emit("notifySomeoneJoinChannel", data);
      });

      return responses;
    })
    .catch((error) => {
      // Gérez les erreurs globales ici.
      console.error("Error in addUserListToChannel:", error);
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

export const getBlockedUsersById = async (userId: number): Promise<number[]> => {
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
}

export const fetchConversation = async (userId: number, channelId: number, addMsgToFetchedConversation: (message: Message) => void) => {
  try {
    const response = await fetch(`http://localhost:4000/api/chat/getAllMessagesByChannelId`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json' // Définissez le type de contenu JSON si nécessaire
      },
      body: JSON.stringify({ userId, channelId })
    });
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
    console.log("manage password called client");
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

/*export const isAdmin = async (channelId: number, userId: number) => {
  try {
    const response: Response = await fetch(`http://localhost:4000/api/chat/isAdmin?channelId=${channelId}&userId=${userId}`);
    handleHTTPErrors(response, {});
    const isAdmin = await response.json();
    console.log(isAdmin);
  } catch (error) {
    throw error;
  }
}*/

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
    if (response.ok) {
      
      // Le statut de la réponse est OK (200)
      // Traitez la réponse normalement
    } else {
      // La réponse indique une erreur
      // Extrait le message d'erreur de la réponse
      const errorResponse = await response.json();
      const errorMessage = errorResponse.message; // Assurez-vous que la propriété "message" existe dans la réponse
      console.error(`Erreur de l'API : ${errorMessage}`);
    }
    // handleHTTPErrors(response, {});
    console.log("mute called");
  } catch (errors) {
    throw errors;
  }
}

export const getUsername = async (userId: number): Promise<string> => {
  try {
    const response: Response = await fetch(`http://localhost:4000/api/users/getUsernameWithId?userId=${userId}`);
    handleHTTPErrors(response, {});
    console.log('before await response');
    const username: string = await response.text();
    console.log('after await response');
    return username;
  } catch (errors){
    throw errors;
  }
}
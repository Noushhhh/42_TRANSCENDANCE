import axios from 'axios';
import { Socket } from 'socket.io-client';

interface isChannelNameConnected {
  isConnected: boolean;
  name: string;
}

export const fetchUser = async (
  setChannelHeader: React.Dispatch<React.SetStateAction<Channel[]>>,
  userId: number,
  socket: Socket) => {
  setChannelHeader([]);

  const response = await fetch(`http://localhost:4000/api/chat/getAllConvFromId/${userId}`);
  const listChannelId = await response.json();

  const fetchChannelHeaders = listChannelId.map(async (id: string) => {
    const response = await fetch(`http://localhost:4000/api/chat/getChannelHeader/${id}`);
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

    return header;
  });
  const channelHeaders = await Promise.all(fetchChannelHeaders);
  setChannelHeader(channelHeaders);
};

export const createChannel = async (
  channelName: string,
  password: string,
  userListChannel: {
    username: string;
    id: number;
  }[],
  channelType: string,
  setChannelHeader: React.Dispatch<React.SetStateAction<Channel[]>>,
  userId: number,
  socket: Socket,
) => {
  const channelToAdd = {
    name: channelName,
    password,
    ownerId: userId,
    participants: userListChannel.map((user) => user.id),
    type: channelType,
  };

  try {
    const response = await axios.post(
      'http://localhost:4000/api/chat/addChannelToUser',
      channelToAdd
    );
    fetchUser(setChannelHeader, userId, socket);
    // Traitez la réponse du backend ici si nécessaire
  } catch (error) {
    console.error('Error creating channel:', error);
    // Gérez l'erreur ici
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
    const response = await fetch(`http://localhost:4000/api/chat/getAllConvFromId/${participants[0]}`);

    if (!response) {
      throw new Error('Erreur lors de la récupération des données');
    }

    channelList = await response.json();
  } catch (error) {
    console.error('Erreur lors de la requête:', error);
  }

  for (const convId of channelList) {
    const response = await fetch(`http://localhost:4000/api/chat/getUsersFromChannelId/${convId}`);
    const userList = await response.json();
    if (compareUsersWithNumbers(userList, participants) === true) {
      return convId;
    }
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
  if (users.length < 2){
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

  if (isNaN(channelId) || channelId <= 0 || isNaN(userId) || userId <= 0  || isNaN(callerId) || callerId <= 0){
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

  fetchUser(setChannelHeader, userId, socket);
  return true;
}

export const leaveChannel = async (
  userId: number,
  channelId: number,
  setChannelHeader: React.Dispatch<React.SetStateAction<Channel[]>>,
  socket: Socket): Promise<boolean> => {

  if (isNaN(channelId) || channelId <= 0 || isNaN(userId) || userId <= 0) {
    throw new Error("Invalid parameters");
  }

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Add appropriate headers if needed
    },
    body: JSON.stringify({ userId, channelId }), // Include the data you want to send in the request body
  };

  const response = await fetch(`http://localhost:4000/api/chat/leaveChannel/${userId}/${channelId}`, requestOptions);
  if (!response)
    return false;

  fetchUser(setChannelHeader, userId, socket);
  return true;
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
  } catch (error){
    throw new Error("Error fetching data");
  }
}

export const getUsernamesInChannelFromSubstring = async (
  channelId: number,
  substringLogin: string,
): Promise<User[] | null> => {

  if (isNaN(channelId) || channelId <= 0) {
    throw new Error("Invalid channelId");
  }

  const cleanSubstring: string = encodeURIComponent(substringLogin);

  try {
    const response = await fetch(`http://localhost:4000/api/chat/getLoginsInChannelFromSubstring/${channelId}/${cleanSubstring}`);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const users: User[] = await response.json();
    return users;
  } catch (error) {
    throw new Error("Failed to fetch data");
  }
}

export const banUserList = async (userList: User[], channelId: number, callerId: number): Promise<void> => {
  try {
    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response: Response = await fetch(`http://localhost:4000/api/chat/getNumberUsersInChannel/${channelId}`);
    if (!response){
      throw new Error("Error updating channel");
    }
    const numberUsers: number = await response.json();
    if (numberUsers === 2 && userList[0]){
      console.log("am i logged here");
      const response: Response = await fetch(`http://localhost:4000/api/chat/banUserFromChannel/${userList[0].id}/${channelId}/${callerId}`, requestOptions);
      if (!response.ok) {
        throw new Error("Error updating database");
      }
      return ;
    }

    for (const user of userList) {
      const response: Response = await fetch(`http://localhost:4000/api/chat/banUserFromChannel/${user.id}/${channelId}/${callerId}`, requestOptions);
      if (!response.ok) {
        throw new Error("Error updating database");
      }
    }

  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const kickUserList = async (userList: User[], channelId: number, callerId: number) => {
  try {
    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    for (const user of userList) {
      const response: Response = await fetch(`http://localhost:4000/api/chat/kickUserFromChannel/${user.id}/${channelId}/${callerId}`, requestOptions);
      if (!response.ok) {
        throw new Error("Error updating database");
      }
    }

  } catch (error) {
    console.log("error");
    throw error;
  }
};

export const fetchChannelUsers = async (channelId: number): Promise<User[]> => {

  try {

    const response: Response = await fetch(`http://localhost:4000/api/chat/getUsersFromChannelId/${channelId}`);
    if (!response.ok){
      throw new Error("Error fetching data");
    }
    const users: User[] = await response.json();

    return users;

  } catch (error){
    throw new Error("Error fetching data");
  }

}


export const fetchChannelAdmins = async (channelId: number): Promise<User[]> => {

  try {

    const response: Response = await fetch(`http://localhost:4000/api/chat/getAdmins/${channelId}`);
    if (!response.ok){
      throw new Error("Error fetching data");
    }
    const admins: User[] = await response.json();

    return admins;

  } catch (error){
    throw new Error("Error fetching data");
  }

}

export const fetchUserAdminTable = async (channelId: number): Promise<{user: User, isAdmin: boolean}[]> => {

  try {

    const users: User[] = await fetchChannelUsers(channelId);
    const admins: User[] = await fetchChannelAdmins(channelId);

    const userAdminTable: {user: User, isAdmin: boolean}[] = users.map((user) => ({
      user,
      isAdmin: admins.some((admin) => admin.id === user.id)
    }))

    return userAdminTable;

  } catch (error) {
    throw new Error("Error fetching data");
  }

}

export const manageAdminsToChannel = async (userList: {user: User, isAdmin: boolean}[], channelId: number, inviterId: number): Promise<void> => {

  try {

    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    for (const user of userList) {
      const response: Response = new Response();
      if (user.isAdmin === true){
        const response = await fetch(`http://localhost:4000/api/chat/addAdminToChannel/${inviterId}/${user.user.id}/${channelId}`, requestOptions);
      } else {
        const response = await fetch(`http://localhost:4000/api/chat/removeAdminFromChannel/${inviterId}/${user.user.id}/${channelId}`, requestOptions);
      }
      if (!response.ok) {
        throw new Error("Error updating database");
      }
    }

  } catch(error){
    throw new Error("Error posting data");
  }

}

export const addUserListToChannel = async (userList: User[], channelId: number): Promise<void[] | Response[]> => {

  try {

    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const responses: Promise<Response>[] = [];
    userList.map((user) => {
      let response = fetch(`http://localhost:4000/api/chat/addUserToChannel/${user.id}/${channelId}`, requestOptions);
      responses.push(response);
    })

    return Promise.all(responses).then((data) => data);
  } catch (error) {
    throw new Error("Error posting data");
  }

}
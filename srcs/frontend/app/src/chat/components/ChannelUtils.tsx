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

    let channelInfo: isChannelNameConnected = {
      name: '',
      isConnected: false,
    };

    if (header.name === '') {
      channelInfo = await setHeaderNameWhenTwoUsers(id, userId, socket);
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
    simulatedUserId: number,
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
      ownerId: simulatedUserId,
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
  } catch(error){
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

export const setHeaderNameWhenTwoUsers = async (channelId: string, userId: number, socket: Socket): Promise<isChannelNameConnected> => {
  const channelInfo: isChannelNameConnected = {
    name: '',
    isConnected: false,
  };

  const response = await fetch(`http://localhost:4000/api/chat/getUsersFromChannelId/${channelId}`);
  const users: User[] = await response.json();
  //if (!users)
  //  return "fetch error";
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
import { Socket } from "socket.io-client";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface FriendType {
  id: number;
  publicName?: string;
  userName: string;
  avatar?: string;
}

export const sendFriendRequest = async (targetId: number) => {
  const response = await fetch(`${API_BASE_URL}/api/users/sendFriendRequest`, {
    method: 'POST',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: targetId })
  });

  if (!response.ok)
    return Promise.reject(await response.json());
}

export const fetchPendingRequests = async (
  setPendingRequests: (value: React.SetStateAction<FriendType[]>) => void,
  setRequestsNumber: (value: React.SetStateAction<number>) => void): Promise<FriendType[]> => {

  const response = await fetch(
    `${API_BASE_URL}/api/users/getPendingRequests`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) return Promise.reject(await response.json());

  const formattedRes = await response.json();
  const pendingRequests: FriendType[] =
    formattedRes.pendingRequests;

  setPendingRequests((curr) => curr = pendingRequests);
  setRequestsNumber(pendingRequests.length);

  return pendingRequests;
};

export const getFriendsList = async (
  userId: number,
  setFriendsList: (value: React.SetStateAction<FriendType[]>) => void) => {
  const response = await fetch(
    `${API_BASE_URL}/api/users/getFriendsList`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) {
    return Promise.reject(await response.json());
  }


  const formattedRes = await response.json();
  const friendsList: FriendType[] = formattedRes.friendsList;

  setFriendsList(friendsList);
};

export const removeFriend = async (targetId: number, socket: Socket) => {
  const response = await fetch(
    `${API_BASE_URL}/api/users/removeFriend`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: targetId }),
    }
  );

  if (!response.ok) return Promise.reject(await response.json());
  else socket.emit('refreshFriendList', targetId);
};

export const acceptFriendRequest = async (targetId: number,
  socket: Socket) => {
  const response = await fetch(
    `${API_BASE_URL}/api/users/acceptFriendRequest`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: targetId }),
    }
  );

  if (!response.ok) return Promise.reject(await response.json());
  else socket.emit('friendRequestAccepted', targetId);
};

export const refuseFriendRequest = async (targetId: number,
  socket: Socket) => {
  const response = await fetch(
    `${API_BASE_URL}/api/users/refuseFriendRequest`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: targetId }),
    }
  );

  if (!response.ok) return Promise.reject(await response.json());
  else socket.emit('friendRequestRefused', targetId);
};

import { Socket } from "socket.io-client";

interface FriendType {
  id: number;
  publicName?: string;
  userName: string;
}

export const sendFriendRequest = async (senderId: number, targetId: number) => {
  const response = await fetch("http://localhost:4000/api/users/sendFriendRequest", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ senderId, targetId })
  });

  if (!response.ok)
    return Promise.reject(await response.json());
}

export const fetchPendingRequests = async (
  userId: number, setPendingRequests: (value: React.SetStateAction<FriendType[]>) => void,
  setRequestsNumber: (value: React.SetStateAction<number>) => void): Promise<FriendType[]> => {

  const response = await fetch(
    "http://localhost:4000/api/users/getPendingRequests",
    {
      method: "GET",
      credentials: "include",
      headers: {
        "X-User-ID": userId.toString(),
      },
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
    "http://localhost:4000/api/users/getFriendsList",
    {
      method: "GET",
      credentials: "include",
      headers: {
        "X-User-ID": userId.toString(),
      },
    }
  );

  if (!response.ok) {
    return Promise.reject(await response.json());
  }

  const formattedRes = await response.json();
  const friendsList: FriendType[] = formattedRes.friendsList;

  setFriendsList(friendsList);
};

export const removeFriend = async (myId: number, friend: FriendType, socket: Socket) => {
  const senderId = myId;
  const targetId = friend.id;
  const response = await fetch(
    "http://localhost:4000/api/users/removeFriend",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ senderId, targetId }),
    }
  );

  if (!response.ok) return Promise.reject(await response.json());

  socket.emit('refreshFriendList', targetId);
};

export const acceptFriendRequest = async (senderId: number, targetId: number,
  socket: Socket) => {
  const response = await fetch(
    "http://localhost:4000/api/users/acceptFriendRequest",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ senderId, targetId }),
    }
  );

  if (!response.ok) {
    return Promise.reject(await response.json());
  }

  socket.emit('friendRequestAccepted', targetId);
};

export const refuseFriendRequest = async (senderId: number, targetId: number,
  socket: Socket) => {
  const response = await fetch(
    "http://localhost:4000/api/users/refuseFriendRequest",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ senderId, targetId }),
    }
  );

  if (!response.ok) {
    return Promise.reject(await response.json());
  }

  socket.emit('friendRequestRefused', targetId);
};

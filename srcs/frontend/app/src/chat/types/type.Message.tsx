

interface MessageToStore{
	channelId: number;
	  content: string;
	  senderId: number;
}

interface Message {
	senderId: number;
	channelId: number;
	content: string;
	createdAt: Date;
    id: 0;
    messageType: string;
}
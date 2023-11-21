

interface MessageToStore{
	channelId: number;
	content: string;
	senderId: number;
}

interface User {
	id: number;
	username: string;
	isBlocked: boolean;
	publicName: string | null;
	avatar: string;
}

interface Message {
    id: 0;
	senderId: number;
	channelId: number;
	content: string;
	createdAt: Date;
    messageType: string;
}
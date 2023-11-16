

interface MessageToStore{
	channelId: number;
	content: string;
	senderId: number;
}

interface User {
	id: number;
	username: string;
	login: string;
	hashPassword: string;
	email: string | null;
	firstName: string | null;
	lastName: string | null;
	isBlocked: boolean;
	publicName: string | null;
}

interface Message {
    id: 0;
	senderId: number;
	channelId: number;
	content: string;
	createdAt: Date;
    messageType: string;
}
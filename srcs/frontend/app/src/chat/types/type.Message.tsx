

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
}

interface Message {
	senderId: number;
	channelId: number;
	content: string;
	createdAt: Date;
    id: 0;
    messageType: string;
}
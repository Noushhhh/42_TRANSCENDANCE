
interface Channel {
    name: string;
    lastMsg: string;
    dateLastMsg: Date;
    channelId: number;
    isConnected: boolean;
}

/*interface Channel {
    id:               number;
  
    name:             string;
    type:             number; 
    password:         string;
  
    owner:            User ;
    ownerId:          number;
    admins:           User[];      
  
    participants:     User[];
    messages:         Message[];
    bannedUsers:     User[];
    mutedUsers:      User[];
}*/

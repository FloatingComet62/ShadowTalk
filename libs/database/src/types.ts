export type User = {
  id: string;
  name: string;
  password: string;
  salt: string;
  pfp?: string;
}

export type Token = {
  id: string;
  user_id: string;
}

export type Channel = {
  id: string;
  name: string;
  members: string[]; // user ids
  pfp?: string;
}

export type Message = {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  read_by: string[]; // user ids
  timestamp: Date;
}

export interface ConnectionInterface {
  createTokenTable(): Promise<void>;
  getToken(token: string): Promise<Token | null>;
  createToken(user_id: string): Promise<string>; // returns token
  deleteToken(token: string): Promise<void>;

  createUserTable(): Promise<void>;
  createUser(user: Omit<User, 'id'>): Promise<string>; // returns id
  getUser(id: string): Promise<User | null>;
  doesUserExist(name: string): Promise<boolean>;
  validateUserPassword(name: string, password: string): Promise<User | null>;

  createChannelTable(): Promise<void>;
  createChannel(channel: Omit<Channel, 'id'>): Promise<string>; // returns id
  getChannel(id: string): Promise<Channel | null>;
  getChannelsByUserId(userId: string): Promise<Channel[]>;
  addUserToChannel(channelId: string, userId: string): Promise<boolean>; // returns true if user was added
  removeUserFromChannel(channelId: string, userId: string): Promise<void>;
  deleteChannel(id: string): Promise<void>;

  createMessageTable(): Promise<void>;
  createMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<string>; // returns id
  getMessage(id: string): Promise<Message | null>;
  // the pagination goes from bottom to top, so start_from_bottom = 0 means the most recent messages
  getMessagesByChannelIdPagination(channelId: string, start_from_bottom: number, number_of_items: number): Promise<Message[]>;
  getUnreadMessagesByUserIdAndChannelId(channelId: string, userId: string): Promise<Message[]>; // returns unread messages for a user in a channel
  markMessageAsRead(messageId: string, userId: string): Promise<void>; // marks a message as read by a user
  deleteMessage(id: string): Promise<void>;
  deleteMessagesByChannelId(channelId: string): Promise<void>;
}

export const ConnectionInterfaceMethods = [
  { name: 'createTokenTable', args: [] },
  { name: 'getToken', args: ['token'] },
  { name: 'createToken', args: ['user_id'] },
  { name: 'deleteToken', args: ['token'] },

  { name: 'createUserTable', args: [] },
  { name: 'createUser', args: ['user'] },
  { name: 'getUser', args: ['id'] },
  { name: 'doesUserExist', args: ['name'] },
  { name: 'validateUserPassword', args: ['name', 'password'] },

  { name: 'createChannelTable', args: [] },
  { name: 'createChannel', args: ['channel'] },
  { name: 'getChannel', args: ['id'] },
  { name: 'getChannelsByUserId', args: ['userId'] },
  { name: 'addUserToChannel', args: ['channelId', 'userId'] },
  { name: 'removeUserFromChannel', args: ['channelId', 'userId'] },
  { name: 'deleteChannel', args: ['id'] },

  { name: 'createMessageTable', args: [] },
  { name: 'createMessage', args: ['message'] },
  { name: 'getMessage', args: ['id'] },
  { name: 'getMessagesByChannelIdPagination', args: ['channelId', 'start_from_bottom', 'number_of_items'] },
  { name: 'getUnreadMessagesByUserIdAndChannelId', args: ['channelId', 'userId'] },
  { name: 'markMessageAsRead', args: ['messageId', 'userId'] },
  { name: 'deleteMessage', args: ['id'] },
  { name: 'deleteMessagesByChannelId', args: ['channelId'] },
] as const;
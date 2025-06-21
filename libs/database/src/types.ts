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
  createTokenTable(): void;
  getToken(token: string): Token | null;
  createToken(user_id: string): string; // returns token
  deleteToken(token: string): void;

  createUserTable(): void;
  createUser(user: Omit<User, 'id'>): string; // returns id
  getUser(id: string): User | null;
  doesUserExist(name: string): boolean;
  validateUserPassword(name: string, password: string): User | null;

  createChannelTable(): void;
  createChannel(channel: Omit<Channel, 'id'>): string; // returns id
  getChannel(id: string): Channel | null;
  getChannelsByUserId(userId: string): Channel[];
  addUserToChannel(channelId: string, userId: string): boolean; // returns true if user was added
  removeUserFromChannel(channelId: string, userId: string): void;
  deleteChannel(id: string): void;

  createMessageTable(): void;
  createMessage(message: Omit<Message, 'id' | 'timestamp'>): string; // returns id
  getMessage(id: string): Message | null;
  // the pagination goes from bottom to top, so start_from_bottom = 0 means the most recent messages
  getMessagesByChannelIdPagination(channelId: string, start_from_bottom: number, number_of_items: number): Message[];
  getUnreadMessagesByUserIdAndChannelId(channelId: string, userId: string): Message[]; // returns unread messages for a user in a channel
  markMessageAsRead(messageId: string, userId: string): void; // marks a message as read by a user
  deleteMessage(id: string): void;
  deleteMessagesByChannelId(channelId: string): void;
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
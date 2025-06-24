import { readFileSync, writeFileSync } from "fs";
import { ConnectionInterface, Channel, Message, Token, User } from "./types";
import { randomBytes, pbkdf2Sync, timingSafeEqual } from 'crypto';

function generateSalt() {
  return randomBytes(128).toString('base64');
}
function hashPassword(password: string, salt: string) {
  return pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('base64');
}

type Data = {
  user?: Record<string, User>;
  token?: Record<string, Token>;
  channel?: Record<string, Channel>;
  message?: Record<string, Message>;
};

export class Connection implements ConnectionInterface {
  data: Data;

  constructor(load_data = true) {
    if (!load_data) {
      this.data = {};
      return;
    }
    this.data = this.load();
  }

  async save(): Promise<void> {
    const fileData = JSON.stringify(this.data, null, 2);
    writeFileSync(process.env.FILE_DB, fileData, "utf-8");
  }

  load(): Data {
    try {
      const fileData = readFileSync(process.env.FILE_DB, "utf-8");
      return JSON.parse(fileData) as Data;
    } catch {
      return {};
    }
  }

  async close(): Promise<void> {
    this.save();
  }

  async createTokenTable(): Promise<void> {
    if (!this.data.token) {
      this.data.token = {};
    }
  }
  async getToken(id: string): Promise<Token | null> {
    if (!this.data.token) {
      await this.createTokenTable();
    }
    if (!this.data.token[id]) {
      return null;
    }
    return this.data.token[id] as Token;
  }
  async createToken(user_id: string): Promise<string> {
    if (!this.data.token) {
      this.data.token = {};
    }
    const id = crypto.randomUUID();
    this.data.token[id] = {
      id: id,
      user_id: user_id,
    };
    await this.save();
    return id;
  }
  async deleteToken(id: string): Promise<void> {
    if (this.data.token && this.data.token[id]) {
      delete this.data.token[id];
      await this.save();
    }
  }

  async createUserTable(): Promise<void> {
    if (!this.data.user) {
      this.data.user = {};
    }
  }
  async createUser(user: Omit<User, 'id' | 'salt'>): Promise<string> {
    if (!this.data.user) {
      await this.createUserTable();
    }
    const id = crypto.randomUUID();
    const salt = generateSalt();
    user.password = hashPassword(user.password, salt);
    this.data.user[id] = {
      id: id,
      ...user,
      salt
    };
    await this.save();
    return id;
  }
  async getUser(id: string): Promise<User | null> {
    if (!this.data.user || !this.data.user[id]) {
      return null;
    }
    return this.data.user[id] as User;
  }
  async regenerateUUID(user_id: string): Promise<string | null> {
    if (!this.data.user || !this.data.user[user_id]) {
      return null;
    }

    // User table
    const user = this.data.user[user_id] as User;
    const newId = crypto.randomUUID();
    user.id = newId;
    this.data.user[newId] = user;
    delete this.data.user[user_id];

    // Token table
    if (this.data.token) {
      for (const tokenId in this.data.token) {
        if (this.data.token[tokenId].user_id === user_id) {
          this.data.token[tokenId].user_id = newId;
        }
      }
    }

    // Channel table
    if (this.data.channel) {
      for (const channelId in this.data.channel) {
        const channel = this.data.channel[channelId] as Channel;
        const index = channel.members.findIndex((memberId) => memberId === user_id);
        if (index !== -1) {
          channel.members[index] = newId;
        }
      }
    }

    // Message table
    if (this.data.message) {
      for (const messageId in this.data.message) {
        const message = this.data.message[messageId] as Message;
        if (message.sender_id === user_id) {
          message.sender_id = newId;
        }
        const index = message.read_by.findIndex((readUserId) => readUserId === user_id);
        if (index !== -1) {
          message.read_by[index] = newId;
        }
      }
    }

    await this.save();
    return newId; // Return the new ID
  }
  async doesUserExist(name: string): Promise<boolean> {
    if (!this.data.user) {
      return false;
    }
    for (const user of Object.values(this.data.user)) {
      if (user.name === name) {
        return true;
      }
    }
    return false;
  }
  async validateUserPassword(name: string, password: string): Promise<User | null> {
    if (!this.data.user) {
      return null;
    }
    for (const user of Object.values(this.data.user)) {
      if (user.name !== name) {
        continue;
      }
      const hash = hashPassword(password, user.salt);
      return timingSafeEqual(Buffer.from(user.password), Buffer.from(hash)) ? user : null;
    }
    return null;
  }

  async createChannelTable(): Promise<void> {
    if (!this.data.channel) {
      this.data.channel = {};
    }
  }
  async createChannel(channel: Omit<Channel, 'id'>): Promise<string> {
    if (!this.data.channel) {
      await this.createChannelTable();
    }
    const id = crypto.randomUUID();
    this.data.channel[id] = {
      id: id,
      ...channel,
      members: channel.members || [],
    };
    await this.save();
    return id;
  }
  async getChannel(id: string): Promise<Channel | null> {
    if (!this.data.channel || !this.data.channel[id]) {
      return null;
    }
    return this.data.channel[id] as Channel;
  }
  async getChannelsByUserId(userId: string): Promise<Channel[]> {
    if (!this.data.channel) {
      return [];
    }
    return Object.values(this.data.channel).filter(
      (channel) => channel.members?.includes(userId),
    ) as Channel[];
  }
  async addUserToChannel(channelId: string, userId: string): Promise<boolean> {
    if (!this.data.channel) {
      await this.createChannelTable();
    }
    if (!this.data.channel[channelId]) {
      return false; // Channel does not exist
    }
    const channel = this.data.channel[channelId] as Channel;
    if (channel.members?.includes(userId)) {
      return false; // User already in channel
    }
    channel.members = [...channel.members, userId];
    await this.save();
    return true; // User added successfully
  }
  async removeUserFromChannel(channelId: string, userId: string): Promise<void> {
    if (!this.data.channel || !this.data.channel[channelId]) {
      return; // Channel does not exist
    }
    const channel = this.data.channel[channelId] as Channel;
    if (!channel.members?.includes(userId)) {
      return; // User not in channel
    }
    channel.members = channel.members.filter((id) => id !== userId);
    if (channel.members.length === 0) {
      await this.deleteChannel(channelId);
    }
    await this.save();
  }
  async deleteChannel(id: string): Promise<void> {
    if (!this.data.channel || !this.data.channel[id]) {
      return; // Channel does not exist
    }
    delete this.data.channel[id];
    await this.save();
  }

  async createMessageTable(): Promise<void> {
    if (!this.data.message) {
      this.data.message = {};
    }
  }
  async createMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<string> {
    if (!this.data.message) {
      await this.createMessageTable();
    }
    const id = crypto.randomUUID();
    this.data.message[id] = {
      id: id,
      ...message,
      timestamp: new Date(),
    };
    await this.save();
    return id;
  }
  async getMessage(id: string): Promise<Message | null> {
    if (!this.data.message || !this.data.message[id]) {
      return null; // Message does not exist
    }
    return this.data.message[id] as Message;
  }
  async getMessagesByChannelIdPagination(channelId: string, start_from_bottom: number, number_of_items: number): Promise<Message[]> {
    if (!this.data.message || !this.data.channel || !this.data.channel[channelId]) {
      return []; // No messages or channel does not exist
    }
    const messages = Object.values(this.data.message).filter(
      (message) => message.channel_id === channelId,
    ) as Message[];
    
    // Sort messages by timestamp in descending order
    messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Paginate the results
    return messages.slice(start_from_bottom, start_from_bottom + number_of_items);
  }
  async getUnreadMessagesByUserIdAndChannelId(channelId: string, userId: string): Promise<Message[]> {
    if (!this.data.message || !this.data.channel || !this.data.channel[channelId]) {
      return []; // No messages or channel does not exist
    }
    const messages = Object.values(this.data.message).filter(
      (message) => message.channel_id === channelId && !message.read_by?.includes(userId),
    ) as Message[];
    
    // Sort messages by timestamp in descending order
    messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return messages;
  }
  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    if (!this.data.message || !this.data.message[messageId]) {
      return; // Message does not exist
    }
    const message = this.data.message[messageId] as Message;
    if (!message.read_by.includes(userId)) {
      message.read_by.push(userId);
      await this.save();
    }
  }
  async deleteMessage(id: string): Promise<void> {
    if (!this.data.message || !this.data.message[id]) {
      return; // Message does not exist
    }
    delete this.data.message[id];
    await this.save();
  }
  async deleteMessagesByChannelId(channelId: string): Promise<void> {
    if (!this.data.message || !this.getChannel(channelId)) {
      return; // No messages to delete
    }
    for (const id in this.data.message) {
      if (this.data.message[id].channel_id === channelId) {
        delete this.data.message[id];
      }
    }
    await this.save();
  }
}
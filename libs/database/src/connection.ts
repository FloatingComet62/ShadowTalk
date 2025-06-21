import { readFileSync, writeFileSync } from "fs";
import { ConnectionInterface, Channel, Message, Token, User } from "./types";

type Data = {
  user?: Record<string, User>;
  token?: Record<string, Token>;
  channel?: Record<string, Channel>;
  message?: Record<string, Message>;
};

export class Connection implements ConnectionInterface {
  data: Data;

  constructor() {
    this.data = this.load();
  }
  save(): void {
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

  createTokenTable(): void {
    if (!this.data.token) {
      this.data.token = {};
    }
  }
  getToken(id: string): Token | null {
    if (!this.data.token) {
      this.createTokenTable();
    }
    if (!this.data.token[id]) {
      return null;
    }
    return this.data.token[id] as Token;
  }
  createToken(user_id: string): string {
    if (!this.data.token) {
      this.data.token = {};
    }
    const id = crypto.randomUUID();
    this.data.token[id] = {
      id: id,
      user_id: user_id,
    };
    this.save();
    return id;
  }
  deleteToken(id: string): void {
    if (this.data.token && this.data.token[id]) {
      delete this.data.token[id];
      this.save();
    }
  }

  createUserTable(): void {
    if (!this.data.user) {
      this.data.user = {};
    }
  }
  createUser(user: Omit<User, 'id'>): string {
    if (!this.data.user) {
      this.createUserTable();
    }
    const id = crypto.randomUUID();
    this.data.user[id] = {
      id: id,
      ...user
    };
    this.save();
    return id;
  }
  getUser(id: string): User | null {
    if (!this.data.user || !this.data.user[id]) {
      return null;
    }
    return this.data.user[id] as User;
  }
  doesUserExist(name: string): boolean {
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
  validateUserPassword(name: string, password: string): User | null {
    if (!this.data.user) {
      return;
    }
    for (const user of Object.values(this.data.user)) {
      if (user.name === name) {
        return user.password === password ? user : null;
      }
    }
  }

  createChannelTable(): void {
    if (!this.data.channel) {
      this.data.channel = {};
    }
  }
  createChannel(channel: Omit<Channel, 'id'>): string {
    if (!this.data.channel) {
      this.createChannelTable();
    }
    const id = crypto.randomUUID();
    this.data.channel[id] = {
      id: id,
      ...channel,
      members: channel.members || [],
    };
    this.save();
    return id;
  }

  getChannel(id: string): Channel | null {
    if (!this.data.channel || !this.data.channel[id]) {
      return null;
    }
    return this.data.channel[id] as Channel;
  }

  getChannelsByUserId(userId: string): Channel[] {
    if (!this.data.channel) {
      return [];
    }
    return Object.values(this.data.channel).filter(
      (channel) => channel.members?.includes(userId),
    ) as Channel[];
  }

  addUserToChannel(channelId: string, userId: string): boolean {
    if (!this.data.channel) {
      this.createChannelTable();
    }
    if (!this.data.channel[channelId]) {
      return false; // Channel does not exist
    }
    const channel = this.data.channel[channelId] as Channel;
    if (channel.members?.includes(userId)) {
      return false; // User already in channel
    }
    channel.members = [...channel.members, userId];
    this.save();
    return true; // User added successfully
  }

  removeUserFromChannel(channelId: string, userId: string): void {
    if (!this.data.channel || !this.data.channel[channelId]) {
      return; // Channel does not exist
    }
    const channel = this.data.channel[channelId] as Channel;
    if (!channel.members?.includes(userId)) {
      return; // User not in channel
    }
    channel.members = channel.members.filter((id) => id !== userId);
    if (channel.members.length === 0) {
      this.deleteChannel(channelId);
    }
    this.save();
  }

  deleteChannel(id: string): void {
    if (!this.data.channel || !this.data.channel[id]) {
      return; // Channel does not exist
    }
    delete this.data.channel[id];
    this.save();
  }

  createMessageTable(): void {
    if (!this.data.message) {
      this.data.message = {};
    }
  }

  createMessage(message: Omit<Message, 'id' | 'timestamp'>): string {
    if (!this.data.message) {
      this.createMessageTable();
    }
    const id = crypto.randomUUID();
    this.data.message[id] = {
      id: id,
      ...message,
      timestamp: new Date(),
    };
    this.save();
    return id;
  }

  getMessage(id: string): Message | null {
    if (!this.data.message || !this.data.message[id]) {
      return null; // Message does not exist
    }
    return this.data.message[id] as Message;
  }

  getMessagesByChannelId(channelId: string): Message[] {
    if (!this.data.message) {
      return [];
    }
    const channel = this.getChannel(channelId);
    if (!channel) {
      return []; // Channel does not exist
    }

    return Object.values(this.data.message).filter(
      (message) => message.channel_id === channelId,
    ) as Message[];
  }

  getMessagesByChannelIdFromTimestamp(
    channelId: string,
    timestamp: Date,
  ): Message[] {
    if (!this.data.message) {
      return [];
    }
    const channel = this.getChannel(channelId);
    if (!channel) {
      return []; // Channel does not exist
    }

    return Object.values(this.data.message).filter(
      (message) =>
        message.channel_id === channelId && message.timestamp >= timestamp,
    ) as Message[];
  }

  deleteMessage(id: string): void {
    if (!this.data.message || !this.data.message[id]) {
      return; // Message does not exist
    }
    delete this.data.message[id];
    this.save();
  }

  deleteMessagesByChannelId(channelId: string): void {
    if (!this.data.message || !this.getChannel(channelId)) {
      return; // No messages to delete
    }
    for (const id in this.data.message) {
      if (this.data.message[id].channel_id === channelId) {
        delete this.data.message[id];
      }
    }
    this.save();
  }
}
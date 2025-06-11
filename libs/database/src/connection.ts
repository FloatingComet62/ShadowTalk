import { readFileSync, writeFileSync } from "fs";
import { ConnectionInterface, Token, User } from "./types";

type Data = {
  user?: Record<string, User>;
  token?: Record<string, Token>;
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
    if (!this.data.token || !this.data.token[id]) {
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
      this.data.user = {};
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
    return;
  }
}
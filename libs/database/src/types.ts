export type User = {
  id: string;
  name: string;
  password: string;
  pfp?: string;
}

export type Token = {
  id: string;
  user_id: string;
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
  { name: 'validateUserPassword', args: ['name', 'password'] }
] as const;
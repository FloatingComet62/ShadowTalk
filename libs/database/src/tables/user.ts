import { Log } from "@shadowtalk/logging";
import { Connection } from "../connection";

type User = {
  id: string;
  name: string;
  password: string;
}

function createUserTable(connection: Connection, logger: Log): void {
  logger.info("Creating user table");
  connection.createTable("user");
}

function createUser(connection: Connection, logger: Log, user: Omit<User, 'id'>): void {
  logger.info(`Creating user: ${JSON.stringify(user)}`);
  const id = crypto.randomUUID();
  connection.setInTable("user", id, user);
}

function getUser(connection: Connection, logger: Log, id: string): User | null {
  logger.info(`Getting user with id: ${id}`);
  const data = connection.getFromTable("user", id);
  if (!data) {
    return null;
  }
  return {
    id,
    ...data
  } as User;
}

function updateUser(connection: Connection, logger: Log, id: string, user: Partial<Omit<User, 'id'>>): void {
  logger.info(`Updating user with id: ${id}, data: ${JSON.stringify(user)}`);
  connection.updateInTable("user", id, user);
}

function deleteUser(connection: Connection, logger: Log, id: string): void {
  logger.info(`Deleting user with id: ${id}`);
  connection.deleteFromTable("user", id);
}

export function bindConnection(connection: Connection, logger: Log): {
  createUserTable: () => void;
  createUser: (user: Omit<User, 'id'>) => void;
  getUser: (id: string) => User | null;
  updateUser: (id: string, user: Partial<Omit<User, 'id'>>) => void;
  deleteUser: (id: string) => void;
} {
  createUserTable(connection, logger);
  return {
    createUserTable: createUserTable.bind(null, connection, logger),
    createUser: createUser.bind(null, connection, logger),
    getUser: getUser.bind(null, connection, logger),
    updateUser: updateUser.bind(null, connection, logger),
    deleteUser: deleteUser.bind(null, connection, logger),
  };
};
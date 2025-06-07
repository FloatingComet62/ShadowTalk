import { Log } from "@shadowtalk/logging";
import { Connection } from "../connection";

type Token = {
  id: string;
  user_id: string;
}

function createTokenTable(connection: Connection, logger: Log): void {
  logger.info('Creating token table');
  connection.createTable("token");
}

function createToken(connection: Connection, logger: Log, token: Omit<Token, 'id'>): string {
  logger.info('Creating token:', token);
  const id = crypto.randomUUID();
  connection.setInTable("token", id, token);
  return id;
}

function getToken(connection: Connection, logger: Log, id: string): Token | null {
  logger.info('Getting token with id:', id);
  const data = connection.getFromTable("token", id);
  if (!data) {
    return null;
  }
  return {
    id,
    ...data
  } as Token;
}

function updateToken(connection: Connection, logger: Log, id: string, token: Partial<Omit<Token, 'id'>>): void {
  logger.info('Updating token with id:', id, 'data:', token);
  connection.updateInTable("token", id, token);
}

function deleteToken(connection: Connection, logger: Log, id: string): void {
  logger.info('Deleting token with id:', id);
  connection.deleteFromTable("token", id);
}

export function bindConnection(connection: Connection, logger: Log): {
  createTokenTable: () => void;
  createToken: (token: Omit<Token, 'id'>) => void;
  getToken: (id: string) => Token | null;
  updateToken: (id: string, token: Partial<Omit<Token, 'id'>>) => void;
  deleteToken: (id: string) => void;
} {
  createTokenTable(connection, logger);
  return {
    createTokenTable: createTokenTable.bind(null, connection, logger),
    createToken: createToken.bind(null, connection, logger),
    getToken: getToken.bind(null, connection, logger),
    updateToken: updateToken.bind(null, connection, logger),
    deleteToken: deleteToken.bind(null, connection, logger)
  };
};
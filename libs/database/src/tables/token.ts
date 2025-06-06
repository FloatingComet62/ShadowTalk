import { Connection } from "../connection";

type Token = {
    id: string;
    token_id: string;
}

function createTokenTable(connection: Connection): void {
    connection.createTable("token");
}

function createToken(connection: Connection, token: Omit<Token, 'id'>): void {
    const id = crypto.randomUUID();
    connection.setInTable("token", id, token);
}

function getToken(connection: Connection, id: string): Token | null {
    const data = connection.getFromTable("token", id);
    if (!data) {
        return null;
    }
    return {
        id,
        ...data
    } as Token;
}

function updateToken(connection: Connection, id: string, token: Partial<Omit<Token, 'id'>>): void {
    connection.updateInTable("token", id, token);
}

function deleteToken(connection: Connection, id: string): void {
    connection.deleteFromTable("token", id);
}

export function bindConnection(connection: Connection): {
    createTokenTable: () => void;
    createToken: (token: Omit<Token, 'id'>) => void;
    getToken: (id: string) => Token | null;
    updateToken: (id: string, token: Partial<Omit<Token, 'id'>>) => void;
    deleteToken: (id: string) => void;
} {
    createTokenTable(connection);
    return {
        createTokenTable: createTokenTable.bind(null, connection),
        createToken: createToken.bind(null, connection),
        getToken: getToken.bind(null, connection),
        updateToken: updateToken.bind(null, connection),
        deleteToken: deleteToken.bind(null, connection)
    };
};
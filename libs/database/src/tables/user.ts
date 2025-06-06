import { Connection } from "../connection";

type User = {
    id: string;
    name: string;
    password: string;
}

function createUserTable(connection: Connection): void {
    connection.createTable("user");
}

function createUser(connection: Connection, user: Omit<User, 'id'>): void {
    const id = crypto.randomUUID();
    connection.setInTable("user", id, user);
}

function getUser(connection: Connection, id: string): User | null {
    const data = connection.getFromTable("user", id);
    if (!data) {
        return null;
    }
    return {
        id,
        ...data
    } as User;
}

function updateUser(connection: Connection, id: string, user: Partial<Omit<User, 'id'>>): void {
    connection.updateInTable("user", id, user);
}

function deleteUser(connection: Connection, id: string): void {
    connection.deleteFromTable("user", id);
}

export function bindConnection(connection: Connection): {
    createUserTable: () => void;
    createUser: (user: Omit<User, 'id'>) => void;
    getUser: (id: string) => User | null;
    updateUser: (id: string, user: Partial<Omit<User, 'id'>>) => void;
    deleteUser: (id: string) => void;
} {
    createUserTable(connection);
    return {
        createUserTable: createUserTable.bind(null, connection),
        createUser: createUser.bind(null, connection),
        getUser: getUser.bind(null, connection),
        updateUser: updateUser.bind(null, connection),
        deleteUser: deleteUser.bind(null, connection)
    };
};
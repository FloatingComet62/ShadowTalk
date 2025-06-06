export interface ConnectionInterface<V> {
    createTable(tableName: string): void;
    getFromTable(tableName: string, key: string): V;
    setInTable(tableName: string, key: string, value: V): void;
    deleteFromTable(tableName: string, key: string): void;
    updateInTable(tableName: string, key: string, value: Partial<V>): void;
    searchInTable(tableName: string, query: (item: V) => boolean): V[];
}
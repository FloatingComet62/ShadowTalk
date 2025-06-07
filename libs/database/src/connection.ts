import { readFileSync, writeFileSync } from "fs";
import { ConnectionInterface } from "./types";

type Value = {
  [key: string]: string | number | boolean | null;
}
type Data = {
  [key: string]: {
    [key: string]: Value;
  }
}

export class Connection implements ConnectionInterface<Value> {
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
  createTable(tableName: string): void {
    if (this.data[tableName]) {
      return;
    }
    this.data[tableName] = {};
    this.save();
  }
  getFromTable(tableName: string, key: string): Value {
    if (!this.data[tableName]) {
      return null;
    }
    return this.data[tableName][key] || null;
  }
  setInTable(tableName: string, key: string, value: Value): void {
    if (!this.data[tableName]) {
      this.createTable(tableName);
    }
    this.data[tableName][key] = value;
    this.save();
  }
  deleteFromTable(tableName: string, key: string): void {
    if (!this.data[tableName] || !this.data[tableName][key]) {
      return;
    }
    delete this.data[tableName][key];
    this.save();
  }
  updateInTable(tableName: string, key: string, value: Partial<Value>): void {
    if (!this.data[tableName] || !this.data[tableName][key]) {
      return;
    }
    const existingData = this.data[tableName][key];
    this.data[tableName][key] = { ...existingData, ...value };
    this.save();
  }
  searchInTable<T>(tableName: string, query: (key: string, item: T) => boolean): T[] {
    if (!this.data[tableName]) {
      return null;
    }
    const results: T[] = [];
    for (const key in this.data[tableName]) {
      const item = this.data[tableName][key];
      if (query(key, item as T)) {
        results.push(item as T);
      }
    }
    return results;
  }
}
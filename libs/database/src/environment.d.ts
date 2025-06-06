declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FILE_DB: string;
    }
  }
}

export {};
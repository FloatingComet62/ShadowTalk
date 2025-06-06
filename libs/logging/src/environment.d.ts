declare global {
  namespace NodeJS {
    interface ProcessEnv {
      IS_DEV: string;
    }
  }
}

export {};
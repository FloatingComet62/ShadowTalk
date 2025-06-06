declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
    }
  }
  interface NodeRequire {
    /**
     * Webpack only:
     * Load modules dynamically from a directory at build-time.
     */
    context: (
      directory: string,
      useSubdirectories: boolean,
      regExp: RegExp
    ) => {
      keys(): string[];
      <T = any>(id: string): T;
    };
  }
}

export {};
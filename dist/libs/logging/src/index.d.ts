declare enum LogLevel {
    INFO = 0,
    WARN = 1,
    ERROR = 2,
    NO_LOG = 3
}
export declare class Log {
    log_level: LogLevel;
    workspace: string[];
    constructor(log_level: LogLevel, workspace: string[]);
    addWorkspace(workspace: string): Log;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}
export declare function infoLogger(workspace: string[]): Log;
export declare function warnLogger(workspace: string[]): Log;
export declare function errorLogger(workspace: string[]): Log;
export declare function noLogger(workspace: string[]): Log;
export declare const Logger: typeof infoLogger;
export {};

enum LogLevel {
  INFO,
  WARN,
  ERROR,
  NO_LOG,
}

export class Log {
  log_level: LogLevel;
  workspace: string[];

  constructor(log_level: LogLevel, workspace: string[]) {
    this.log_level = log_level;
    this.workspace = workspace;
  }

  addWorkspace(workspace: string): Log {
    return new Log(this.log_level, [...this.workspace, workspace]);
  }

  info(message: string): void {
    if (this.log_level > LogLevel.INFO) {
      return;
    }
    console.log(`[INFO] ${this.workspace.join('/')}: ${message}`);
  }

  warn(message: string): void {
    if (this.log_level > LogLevel.WARN) {
      return;
    }
    console.warn(`[WARN] ${this.workspace.join('/')}: ${message}`);
  }

  error(message: string): void {
    if (this.log_level > LogLevel.ERROR) {
      return;
    }
    console.error(`[ERROR] ${this.workspace.join('/')}: ${message}`);
  }
}

export function infoLogger(
  workspace: string[],
): Log {
  return new Log(LogLevel.INFO, workspace);
}

export function warnLogger(
  workspace: string[],
): Log {
  return new Log(LogLevel.WARN, workspace);
}

export function errorLogger(
  workspace: string[],
): Log {
  return new Log(LogLevel.ERROR, workspace);
}

export function noLogger(
  workspace: string[],
): Log {
  return new Log(LogLevel.NO_LOG, workspace);
}

export const Logger = process.env.IS_DEV == "true" ? infoLogger : warnLogger;
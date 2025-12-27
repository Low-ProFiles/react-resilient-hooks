export enum LogLevel {
  None = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4,
}

export class Logger {
  constructor(private level: LogLevel = LogLevel.Info) {}

  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  public debug(...args: any[]): void {
    if (this.level >= LogLevel.Debug) {
      console.log('[DEBUG]', ...args);
    }
  }

  public info(...args: any[]): void {
    if (this.level >= LogLevel.Info) {
      console.info('[INFO]', ...args);
    }
  }

  public warn(...args: any[]): void {
    if (this.level >= LogLevel.Warn) {
      console.warn('[WARN]', ...args);
    }
  }

  public error(...args: any[]): void {
    if (this.level >= LogLevel.Error) {
      console.error('[ERROR]', ...args);
    }
  }
}

export const logger = new Logger();

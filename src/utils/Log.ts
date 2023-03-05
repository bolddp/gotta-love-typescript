export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
}

/**
 * An interface for logging. If you want to introduce debug logging in a package,
 * like one of the connectors, make sure to use this interface instead of the
 * concrete Log class to avoid package version conflicts between your app and
 * the packages.
 */
export interface LogInterface {
  log(logLevel: LogLevel, ...args: any[]): void;
  DEBUG(...args: any[]): void;
  INFO(...args: any[]): void;
  WARN(...args: any[]): void;
  ERROR(...args: any[]): void;
}

/**
 * Log class that supports DEBUG, INFO, WARN and ERROR logging.
 * It's log level can be set on the application level, for instance by the
 * value of a Lambda environment variable, making it possible to change
 * the log level without redeploying the Lambda.
 */
export class Log implements LogInterface {
  public static LogLevel = LogLevel.INFO;

  public static setLogLevelByString(logLevel: string) {
    const level = ['DEBUG', 'INFO', 'WARN', 'ERROR'].indexOf(logLevel);
    Log.LogLevel = level < 0 ? LogLevel.INFO : <LogLevel>level;
  }

  private debugId?: string;

  constructor(debugId?: string) {
    this.debugId = debugId;
  }

  private buildMsg(args: any[]): string[] {
    const result: string[] = this.debugId ? [this.debugId] : [];
    return result.concat(
      args.map((arg) => {
        if (typeof arg === 'object') {
          const jsonStr = JSON.stringify(arg);
          // Not outputting JSON data that is larger than 4k
          if (jsonStr.length > 4096) {
            return `<truncated: ${jsonStr.length} bytes>`;
          }
          return jsonStr;
        }
        return arg;
      })
    );
  }

  log(logLevel: LogLevel, ...args: any[]) {
    if (Log.LogLevel <= logLevel) {
      switch (logLevel) {
        case LogLevel.DEBUG:
          console.debug(...this.buildMsg(args));
          break;
        case LogLevel.INFO:
          console.info(...this.buildMsg(args));
          break;
        case LogLevel.WARN:
          console.warn(...this.buildMsg(args));
          break;
        case LogLevel.ERROR:
          console.error(...this.buildMsg(args));
          break;
      }
    }
  }

  DEBUG(...args: any[]) {
    this.log(LogLevel.DEBUG, ...args);
  }

  INFO(...args: any[]) {
    this.log(LogLevel.INFO, ...args);
  }

  WARN(...args: any[]) {
    this.log(LogLevel.WARN, ...args);
  }

  ERROR(...args: any[]) {
    this.log(LogLevel.ERROR, ...args);
  }
}

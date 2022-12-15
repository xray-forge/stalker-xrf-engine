import { default as chalk } from "chalk";

export class Logger {

  public static IS_CONSOLE_ENABLED: boolean = true;
  public static IS_FILE_ENABLED: boolean = false;

  public static FILE_LOG: Array<string> = [];

  private isEnabled: boolean;
  private readonly prefix: string;

  public constructor(prefix: string, isEnabled: boolean = true) {
    this.prefix = chalk.green(`[${prefix}]`);
    this.isEnabled = isEnabled;
  }

  public info(...args: Array<unknown>): void {
    return this.logAs("info", args);
  }

  public warn(...args: Array<unknown>): void {
    return this.logAs("warn", args);
  }

  public error(...args: Array<unknown>): void {
    return this.logAs("error", args);
  }

  protected logAs(method: string, args: Array<unknown>): void {
    const date: Date = new Date();
    const timestamp: string = date.toLocaleTimeString() + " " + date.getMilliseconds();

    if (Logger.IS_FILE_ENABLED) {
      Logger.FILE_LOG.push(`${timestamp} ${this.prefix} ${args.join(" ")}`);
    }

    if (Logger.IS_CONSOLE_ENABLED) {
      return console[method](timestamp, this.prefix, ...args);
    }
  }

}

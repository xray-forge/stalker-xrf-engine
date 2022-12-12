import { default as chalk } from "chalk";

export class Logger {

  private isEnabled: boolean;
  private prefix: string;

  public constructor(prefix: string, isEnabled: boolean = true) {
    this.prefix = chalk.green(`[${prefix}]`);
    this.isEnabled = isEnabled;
  }

  public info(...args: Array<unknown>): void {
    return console.info(this.prefix, ...args);
  }

  public warn(...args: Array<unknown>): void {
    return console.warn(this.prefix, ...args);
  }

  public error(...args: Array<unknown>): void {
    return console.error(this.prefix, ...args);
  }

}

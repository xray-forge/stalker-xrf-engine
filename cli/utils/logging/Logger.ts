import { default as chalk } from "chalk";

import { stringifyValue } from "#/utils/logging/stringifyValue";
import { Optional } from "#/utils/types";

/**
 * Logger file that logs only in dev/flagged environment.
 * Allows to collect app logs in a file for future investigations or dev sharing.
 */
export class Logger {

  public static LOG_FILE_BUFFER: Array<string> = [];
  public static LOG_FILE_BUFFER_LINES_LIMIT: number = 5000;
  public static LOG_FILE_BUFFER_SPLICE: number = 100;

  public static IS_CONSOLE_ENABLED: boolean = true;
  public static IS_FILE_ENABLED: boolean = true;

  /**
   * Global log singleton.
   */
  private static GLOBAL: Optional<Logger> = null;

  private readonly prefix: string;
  private readonly isEnabled: boolean = true;

  /**
   * Get global logger singleton object to do inline printing.
   */
  public static getGlobal(): Logger {
    if (!Logger.GLOBAL) {
      Logger.GLOBAL = new Logger("🪐GLBL");
    }

    return Logger.GLOBAL;
  }

  /**
   * Clear file logs and set string storing buffer as empty.
   */
  public static clearLogs(): void {
    this.LOG_FILE_BUFFER = [];
  }

  /**
   * Log in a file with limited count of lines to save reports with detailed info.
   */
  public static logInFile(text: string): void {
    if (Logger.IS_FILE_ENABLED) {
      Logger.LOG_FILE_BUFFER.push(text);

      if (Logger.LOG_FILE_BUFFER.length > Logger.LOG_FILE_BUFFER_LINES_LIMIT) {
        Logger.LOG_FILE_BUFFER.splice(0, Logger.LOG_FILE_BUFFER_SPLICE);
      }
    }
  }

  public constructor(prefix: string = "", isEnabled?: boolean) {
    this.prefix = `[${prefix}]`;

    if (isEnabled !== undefined) {
      this.isEnabled = isEnabled;
    }
  }

  public debug(...args: Array<unknown>): void {
    this.logAs("debug", args);
  }

  public warn(...args: Array<unknown>): void {
    this.logAs("warn", args);
  }

  public error(...args: Array<unknown>): void {
    this.logAs("error", args);
  }

  public info(...args: Array<unknown>): void {
    this.logAs("info", args);
  }

  /**
   * Generic log method for simple formatting and logging of information with shared logic.
   */
  private logAs(method: string, args: Array<unknown>): void {
    if (this.isEnabled) {
      const date: Date = new Date();
      const timestamp: string = `${date.toLocaleTimeString("en-GB")}:${
        String(date.getMilliseconds()).padStart(3, "0")}`;

      if (Logger.IS_CONSOLE_ENABLED) {
        console[method](`${timestamp} ${chalk.green(this.prefix)}`, ...args);
      }

      if (Logger.IS_FILE_ENABLED) {
        Logger.logInFile(`${timestamp} [${method}] ${this.prefix} ${args.map((it) => stringifyValue(it)).join(" ")}\n`);
      }
    }
  }

}

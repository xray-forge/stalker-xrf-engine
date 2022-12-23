import { gameConfig } from "@/mod/lib/configs/GameConfig";

export class LuaLogger {
  protected prefix: string;
  protected isEnabled: boolean;

  public constructor(prefix: string, isEnabled: boolean = true) {
    this.prefix = gameConfig.DEBUG.GLOBAL_LOG_PREFIX + "[" + prefix + "]";
    this.isEnabled = isEnabled;

    if (gameConfig.DEBUG.IS_RESOLVE_LOG_ENABLED) {
      this.info("Declared logger: '" + prefix + "'");
    }
  }

  public warn(...args: Array<any>): void {
    this.logAs("[WARN]", args);
  }

  public info(...args: Array<any>): void {
    this.logAs("[INFO]", args);
  }

  public error(...args: Array<any>): void {
    this.logAs("[ERROR]", args);
  }

  protected logAs(method: string, args: Array<any>): void {
    if (gameConfig.DEBUG.IS_LOG_ENABLED && this.isEnabled) {
      const text: string = this.prefix + method + " " + args.map((it) => tostring(it)).join(" ");

      if (method === "[ERROR]") {
        error_log(text);
      } else {
        log(text);
      }
    }
  }
}

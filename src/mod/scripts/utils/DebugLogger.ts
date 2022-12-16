import { environmentConfig } from "@/mod/lib";

export class DebugLogger {

  protected prefix: string;
  protected isEnabled: boolean;

  public constructor(prefix: string, isEnabled: boolean = true) {
    this.prefix = "[DL][" + prefix + "]";
    this.isEnabled = isEnabled;

    if (environmentConfig.IS_DEBUG_RESOLVE_ENABLED) {
      this.info("Created");
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
    if (environmentConfig.IS_DEBUG_LOG_ENABLED && this.isEnabled) {
      log(this.prefix + method + " " + args.map((it) => tostring(it)).join(" "));
    }
  }

}

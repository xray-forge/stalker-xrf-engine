import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";

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

  public table(table: Optional<LuaIterable<any>>, sub: string = ""): void {
    if (gameConfig.DEBUG.IS_LOG_ENABLED && this.isEnabled) {
      if (table === null) {
        return this.info("[TABLE]: null");
      } else {
        this.info("[TABLE]");
      }

      for (const [k, v] of pairs(table)) {
        if (type(v) == "table") {
          this.info(string.format(sub + "%s:", tostring(k)));
          this.table(v, "  ");
        } else if (type(v) == "function") {
          this.info(string.format(sub + "%s:function", tostring(k)));
        } else if (type(v) == "userdata") {
          this.info(string.format(sub + "%s:userdata", tostring(k)));
        } else if (type(v) === "boolean") {
          if (v === true) {
            if (type(k) !== "userdata") {
              this.info(string.format(sub + "%s:true", tostring(k)));
            } else {
              this.info(sub + "userdata:true");
            }
          } else {
            if (type(k) !== "userdata") {
              this.info(string.format(sub + "%s:false", tostring(k)));
            } else {
              this.info(sub + "userdata:false");
            }
          }
        } else {
          if (v !== null) {
            this.info(string.format(sub + "%s:%s", tostring(k), v as any));
          } else {
            this.info(string.format(sub + "%s:<nil>", tostring(k), v));
          }
        }
      }
    }
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

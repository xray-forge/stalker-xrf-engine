import { error_log, log, time_global } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { AnyObject } from "@/mod/lib/types";
import { stringifyAsJson } from "@/mod/lib/utils/json";

export class LuaLogger {
  protected prefix: string;
  protected isEnabled: boolean;

  public constructor(prefix: string, isEnabled: boolean = true) {
    this.prefix = `${gameConfig.DEBUG.GLOBAL_LOG_PREFIX}[${prefix}]`;
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

  public table(table: AnyObject): void;
  public table(table: LuaTable): void {
    if (gameConfig.DEBUG.IS_LOG_ENABLED && this.isEnabled) {
      this.info("[TABLE]", stringifyAsJson(table));
    }
  }

  public error(...args: Array<any>): void {
    this.logAs("[ERROR]", args);
  }

  protected logAs(method: string, args: Array<any>): void {
    if (gameConfig.DEBUG.IS_LOG_ENABLED && this.isEnabled) {
      const text: string = `[${time_global()}]${this.prefix}${method} ${args
        .map((it) => {
          const itType = type(it);

          if (itType === "nil") {
            return "<nil>";
          } else if (itType === "string") {
            return it === "" ? "<empty_str>" : it;
          } else if (itType === "number") {
            return it;
          } else {
            return string.format("<%s: %s>", itType, tostring(it));
          }
        })
        .join(" ")}`;

      if (method === "[ERROR]") {
        error_log(text);
      } else {
        log(text);
      }
    }
  }
}

import { log, print_stack, time_global } from "xray16";

import { stringifyAsJson } from "@/engine/core/utils/transform/json";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { AnyArgs, AnyObject } from "@/engine/lib/types";

/**
 * Lua logger class.
 * Stores prefix, enabled-disabled flags and uses shared statics to print data.
 *
 * todo: This model does not work with lua and JIT optimisation. Probably should use singleton logger and share logic.
 */
export class LuaLogger {
  protected static logAs(method: string, prefix: string, args: LuaTable<number>): void {
    // Map some values to successfully print in composed string.
    for (const idx of $range(1, args.length())) {
      const it = args.get(idx);
      const itType = type(it);

      if (itType === "nil") {
        args.set(idx, "<nil>");
      } else if (itType === "string") {
        args.set(idx, it === "" ? "<empty_str>" : it);
      } else if (itType === "number") {
        args.set(idx, it);
      } else if (itType === "boolean") {
        args.set(idx, string.format("<boolean: %s>", it === true ? "true" : "false"));
      } else {
        args.set(idx, string.format("<%s: %s>", itType, tostring(it)));
      }
    }

    return log(string.format("[%s]%s%s %s", time_global(), prefix, method, table.concat(args, " ")));
  }

  protected prefix: string;
  protected isEnabled: boolean;

  public constructor(prefix: string, isEnabled: boolean = true) {
    this.isEnabled = isEnabled;
    this.prefix = string.format("[%s][%s]", gameConfig.DEBUG.GLOBAL_LOG_PREFIX, prefix);

    if (gameConfig.DEBUG.IS_RESOLVE_LOG_ENABLED) {
      this.info("Declared logger: '" + prefix + "'");
    }
  }

  public warn(...args: AnyArgs): void {
    if (gameConfig.DEBUG.IS_LOG_ENABLED && this.isEnabled) {
      LuaLogger.logAs("[WARN]", this.prefix, args as unknown as LuaTable<number>);
    }
  }

  public info(...args: AnyArgs): void {
    if (gameConfig.DEBUG.IS_LOG_ENABLED && this.isEnabled) {
      LuaLogger.logAs("[INFO]", this.prefix, args as unknown as LuaTable<number>);
    }
  }

  public error(...args: AnyArgs): void {
    if (gameConfig.DEBUG.IS_LOG_ENABLED && this.isEnabled) {
      LuaLogger.logAs("[ERROR]", this.prefix, args as unknown as LuaTable<number>);
    }
  }

  public table(table: AnyObject): void;
  public table(table: LuaTable): void {
    if (gameConfig.DEBUG.IS_LOG_ENABLED && this.isEnabled) {
      LuaLogger.logAs("[TABLE]", this.prefix, [stringifyAsJson(table)] as unknown as LuaTable<number>);
    }
  }

  public pushEmptyLine(): void {
    return this.info(" ");
  }

  public printStack(): void {
    return print_stack();
  }
}

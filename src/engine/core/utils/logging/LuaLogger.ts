import { log, print_stack, time_global } from "xray16";

import { openLogFile } from "@/engine/core/utils/logging/logging_files";
import { ELuaLoggerMode, ILuaLoggerConfig } from "@/engine/core/utils/logging/logging_types";
import { toJSON } from "@/engine/core/utils/transform/json";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import { AnyArgs, AnyObject, Optional, TLabel, TName } from "@/engine/lib/types";

/**
 * Lua logger class.
 * Stores prefix, enabled-disabled flags and uses shared statics to print data.
 *
 * Note: if building in optimized mode, game logging is stripped from lua scripts and does not make it to the code.
 */
export class LuaLogger {
  public readonly prefix: TLabel;

  public isEnabled: boolean;
  public mode: ELuaLoggerMode;

  protected loggerFile: Optional<LuaFile>;
  protected luaFile: LuaFile;

  public constructor(prefix: TLabel, { isEnabled = true, mode = ELuaLoggerMode.SINGLE, file }: ILuaLoggerConfig = {}) {
    this.isEnabled = isEnabled;
    this.mode = mode;
    this.prefix = string.format("[%s]", prefix);
    this.loggerFile = file ? openLogFile(file) : null;
    this.luaFile = openLogFile("lua");

    if (forgeConfig.DEBUG.IS_RESOLVE_LOG_ENABLED) {
      this.format("Declared logger: '" + prefix + "'");
    }
  }

  /**
   * Print generic info level message.
   */
  public format(base: string, ...args: AnyArgs): void {
    if (forgeConfig.DEBUG.IS_LOG_ENABLED && this.isEnabled) {
      this.logAs("[info]", this.prefix, $fromArray([string.format(base, ...args)]));
    }
  }

  /**
   * Print stringified as JSON table into logs file.
   */
  public table(table: AnyObject): void;
  public table(table: LuaTable): void {
    if (forgeConfig.DEBUG.IS_LOG_ENABLED && this.isEnabled) {
      this.logAs("[table]", this.prefix, $fromArray([toJSON(table)]));
    }
  }

  /**
   * Push empty line in logs for readability.
   */
  public pushEmptyLine(): void {
    return this.format(" ");
  }

  /**
   * Push line separator in logs for readability.
   */
  public pushSeparator(): void {
    return this.format("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
  }

  /**
   * Print current lua call stack in game logs.
   */
  public printStack(): void {
    return print_stack();
  }

  /**
   * Get full string prefix for current logger instance.
   */
  public getFullPrefix(): TLabel {
    return string.format("[%s]%s", time_global(), this.prefix);
  }

  /**
   * Print generic message with provided level of logging and configured prefix.
   */
  public logAs(level: string, prefix: string, args: LuaTable<number>): void {
    // Map some values to successfully print in composed string.
    for (const index of $range(1, args.length())) {
      const it = args.get(index);
      const itType: TName = type(it);

      if (itType === NIL) {
        args.set(index, "<nil>");
      } else if (itType === "string") {
        args.set(index, it === "" ? "<empty_str>" : it);
      } else if (itType === "number") {
        args.set(index, it);
      } else if (itType === "boolean") {
        args.set(index, string.format("<boolean: %s>", it === true ? TRUE : FALSE));
      } else if (itType === "userdata") {
        args.set(index, "<userdata>");
      } else {
        args.set(index, string.format("<%s: %s>", itType, tostring(it)));
      }
    }

    const result: string = string.format("[%s]%s%s %s", time_global(), prefix, level, table.concat(args, " "));

    // Write into custom file if it is defined for current logger.
    if (this.loggerFile) {
      this.loggerFile.write(result);
      this.loggerFile.write("\n");
    }

    // Write into shared game console if no file defined/dual mode enabled.
    if (this.loggerFile === null || this.mode === ELuaLoggerMode.DUAL) {
      // Write into custom file if it is defined for current logger.
      if (forgeConfig.DEBUG.IS_SEPARATE_LUA_LOG_ENABLED) {
        this.luaFile.write(result);
        this.luaFile.write("\n");
      }

      log(result);
    }
  }
}

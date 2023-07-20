import { IExtensionsDescriptor, openExtensionIni } from "@/engine/core/utils/extensions";
import { overrideSystemIni } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { IniFile } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

export function register(descriptor: IExtensionsDescriptor): void {
  logger.info("Register ak74u override extension:", descriptor.name);

  const ak74uLtx: IniFile = openExtensionIni(descriptor, "wpn_ak74u.ltx");

  logger.info("Overriding configs with:", ak74uLtx.fname());

  overrideSystemIni(ak74uLtx);
}

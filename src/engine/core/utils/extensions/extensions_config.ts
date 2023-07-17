import { ini_file } from "xray16";

import { IExtensionsDescriptor } from "@/engine/core/utils/extensions/extensions_types";
import { roots } from "@/engine/lib/constants/roots";
import { IniFile, TPath } from "@/engine/lib/types";

/**
 * Open ltx file based on extension configuration files.
 * Hooks up extension FS path and resolves full path based on relative to extension entry.
 *
 * @param extension - extension descriptor
 * @param file - relative extension path from entry point
 * @returns ini file from extension
 */
export function openExtensionIni(extension: IExtensionsDescriptor, file: TPath = "main.ltx"): IniFile {
  return new ini_file(roots.gameData, string.format("extensions\\%s\\%s", extension.name, file));
}

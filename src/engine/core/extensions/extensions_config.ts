import { ini_file } from "xray16";
import { IniFile } from "xray16/alias";
import { TPath } from "xray16/lib";

import { roots } from "@/engine/constants/roots";
import { IExtensionsDescriptor } from "@/engine/core/extensions/extensions_types";

/**
 * Open ltx file based on extension configuration files.
 * Hooks up extension FS path and resolves full path based on relative to extension entry.
 *
 * @param extension - Extension descriptor.
 * @param file - Relative extension path from entry point.
 * @returns Ini file from extension.
 */
export function openExtensionIni(extension: IExtensionsDescriptor, file: TPath = "main.ltx"): IniFile {
  return new ini_file(roots.gameData, string.format("extensions\\%s\\%s", extension.name, file));
}

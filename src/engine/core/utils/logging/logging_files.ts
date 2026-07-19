import { getFS } from "xray16";
import { Nillable, TName, TPath } from "xray16/lib";

import { roots } from "@/engine/constants/roots";
import { loggingRegistry } from "@/engine/core/utils/logging/logging_registry";

/**
 * Open log file and reserve it for writing of logs.
 *
 * @param name - Name of file log.
 * @returns File reference for writing.
 */
export function openLogFile(name: TName): LuaFile {
  const file: Nillable<LuaFile> = loggingRegistry.get(name) as Nillable<LuaFile>;

  if (file) {
    return file;
  }

  const fullPath: TPath = getFS().update_path(roots.logs, string.format("xrf_%s.log", name));
  const [openedFile] = io.open(fullPath, "w");

  if (!openedFile) {
    error(string.format("Could not open file for logging: '%s'.", fullPath), 2);
  }

  openedFile.setvbuf("line");

  loggingRegistry.set(name, openedFile);

  return openedFile;
}

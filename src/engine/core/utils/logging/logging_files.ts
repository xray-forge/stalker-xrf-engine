import { getFS } from "xray16";

import { loggingRegistry } from "@/engine/core/utils/logging/logging_registry";
import { roots } from "@/engine/lib/constants/roots";
import { Optional, TName, TPath } from "@/engine/lib/types";

/**
 * Open log file and reserve it for writing of logs.
 *
 * @param name - name of file log
 * @returns file reference for writing
 */
export function openLogFile(name: TName): LuaFile {
  const file: Optional<LuaFile> = loggingRegistry.get(name);

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

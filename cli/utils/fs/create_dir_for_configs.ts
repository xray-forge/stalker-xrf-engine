import * as fs from "fs";
import * as path from "path";

import { blueBright } from "chalk";

import { NodeLogger, Optional, TFolderReplicationDescriptor } from "#/utils";

/**
 * Sync way for folder creation when needed.
 *
 * @param configs - replication configs to create directory
 * @param log - optional log to print verbose information
 */
export function createDirForConfigs(
  configs: Array<TFolderReplicationDescriptor>,
  log: Optional<NodeLogger> = null
): void {
  configs.forEach(([, to]) => {
    const targetDir: string = path.dirname(to);

    if (!fs.existsSync(targetDir)) {
      log?.debug("MKDIR:", blueBright(targetDir));
      fs.mkdirSync(targetDir, { recursive: true });
    }
  });
}

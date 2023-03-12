import * as fs from "fs";
import * as path from "path";

import { default as chalk } from "chalk";

import { Optional, TFolderReplicationDescriptor } from "@/mod/lib/types";

import { NodeLogger } from "#/utils";

/**
 * Sync way for folder creation when needed.
 */
export function createDirForConfigs(
  configs: Array<TFolderReplicationDescriptor>,
  log: Optional<NodeLogger> = null
): void {
  configs.forEach(([, to]) => {
    const targetDir: string = path.dirname(to);

    if (!fs.existsSync(targetDir)) {
      log?.debug("MKDIR:", chalk.blueBright(targetDir));
      fs.mkdirSync(targetDir, { recursive: true });
    }
  });
}

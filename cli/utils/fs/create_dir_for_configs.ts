import * as fs from "fs";
import * as path from "path";

import { default as chalk } from "chalk";

import { NodeLogger } from "#/utils";

import { Optional, TFolderReplicationDescriptor } from "@/engine/lib/types";

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

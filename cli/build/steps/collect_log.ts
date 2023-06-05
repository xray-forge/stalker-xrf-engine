import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";

import { blueBright, yellowBright } from "chalk";

import { TARGET_DIR } from "#/globals/paths";
import { NodeLogger } from "#/utils";

const log: NodeLogger = new NodeLogger("BUILD_COLLECT_LOG");

/**
 * Collect build detailed build log file.
 */
export async function collectLog(): Promise<void> {
  const fileLogPath: string = path.resolve(TARGET_DIR, "xrf_build.log");

  try {
    if (fs.existsSync(fileLogPath)) {
      await fsPromises.unlink(fileLogPath);
    }

    await fsPromises.writeFile(fileLogPath, NodeLogger.LOG_FILE_BUFFER.join(""));

    log.info(blueBright("File log collected:"), yellowBright(fileLogPath), "\n");
  } catch (error) {
    log.error("Failed to collect log:", error);
  }
}

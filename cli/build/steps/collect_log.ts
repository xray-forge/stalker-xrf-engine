import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";

import { default as chalk } from "chalk";

import { TARGET_DIR } from "#/build/globals";
import { NodeLogger } from "#/utils";

const log: NodeLogger = new NodeLogger("BUILD_COLLECT_LOG");

export async function collectLog(): Promise<void> {
  const fileLogPath: string = path.resolve(TARGET_DIR, "xrts_build.log");

  try {
    if (fs.existsSync(fileLogPath)) {
      await fsPromises.unlink(fileLogPath);
    }

    await fsPromises.writeFile(fileLogPath, NodeLogger.LOG_FILE_BUFFER.join(""));

    log.info(chalk.blueBright("File log collected:"), chalk.yellowBright(fileLogPath), "\n");
  } catch (error) {
    log.error("Failed to collect log:", error);
  }
}

import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";

import { TARGET_DIR } from "#/build/globals";
import { Logger } from "#/utils";

const log: Logger = new Logger("BUILD_COLLECT_LOG");

export async function collectLog(): Promise<void> {
  const fileLogPath: string = path.resolve(TARGET_DIR, "xrts_build.log");

  try {
    if (fs.existsSync(fileLogPath)) {
      await fsPromises.unlink(fileLogPath);
    }

    await fsPromises.writeFile(fileLogPath, Logger.LOG_FILE_BUFFER.join(""));

    log.info("File log collect");
  } catch (error) {
    log.error("Failed to collect log:", error);
  }
}

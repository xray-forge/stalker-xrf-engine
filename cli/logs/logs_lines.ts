import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { yellow } from "chalk";

import { GAME_LOGS_PATH, GAME_PATH } from "#/globals";
import { NodeLogger, Optional, readLastLinesOfFile } from "#/utils";

const log: NodeLogger = new NodeLogger("LOGS");

const GAME_BIN_DESCRIPTOR_DIR: string = path.resolve(GAME_PATH, "bin/bin.json");

/**
 * Print last 'n' lines from logs file.
 */
export async function printLastLogLines(count: number): Promise<void> {
  const linesCount: number = Math.min(Number.isInteger(count) && count > 0 ? count : 15, 200);

  log.info("Printing logs last lines:", linesCount);

  const path: Optional<string> = await getLogFilePath();

  if (path) {
    log.info("Checking logs in:", yellow(path));

    const lines: string = await readLastLinesOfFile(path, linesCount);

    log.info("\n");

    console.info(lines);
  } else {
    log.info("No active logs found, exit");
  }
}

/**
 * Get path of log file.
 */
async function getLogFilePath(): Promise<Optional<string>> {
  const username: string = os.userInfo().username.toLowerCase();

  const openXRayLogPath: string = path.resolve(GAME_LOGS_PATH, `openxray_${username}.log`);
  const baseXRayLogPath: string = path.resolve(GAME_LOGS_PATH, `xray_${username}.log`);

  if (!fs.existsSync(GAME_LOGS_PATH)) {
    log.info("Provided invalid game logs folder or log do not exist:", yellow(GAME_LOGS_PATH));

    return null;
  }

  if (fs.existsSync(GAME_BIN_DESCRIPTOR_DIR)) {
    const binDescriptor: Record<string, unknown> = await import(GAME_BIN_DESCRIPTOR_DIR);

    log.info(
      "Open x-ray engine usage detected:",
      yellow(`${binDescriptor.type} ${binDescriptor.version} ${binDescriptor.release}`)
    );

    if (fs.existsSync(openXRayLogPath)) {
      return openXRayLogPath;
    } else {
      log.warn("Using custom engine, but no logs for it found:", yellow(openXRayLogPath));

      return null;
    }
  }

  if (fs.existsSync(baseXRayLogPath)) {
    return baseXRayLogPath;
  } else {
    log.warn("No logs for engine found in:", yellow(openXRayLogPath));

    return null;
  }
}

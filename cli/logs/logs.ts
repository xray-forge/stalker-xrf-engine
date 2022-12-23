import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as process from "process";

import { default as chalk } from "chalk";

import { Optional } from "@/mod/lib/types";

import { default as config } from "#/config.json";
import { NodeLogger } from "#/utils";
import { readLastLinesOfFile } from "#/utils/fs/read_last_lines_of_file";

const GAME_DIR: string = path.resolve(config.targets.STALKER_GAME_FOLDER_PATH);
const GAME_LOGS_DIR: string = path.resolve(config.targets.STALKER_LOGS_FOLDER_PATH);
const GAME_BIN_DESCRIPTOR_DIR: string = path.resolve(GAME_DIR, "bin/bin.json");

const log: NodeLogger = new NodeLogger("LOGS");
const linesParam: number = Number.parseInt(process.argv[2]);

(async function logs(): Promise<void> {
  const linesCount: number = Math.min(Number.isInteger(linesParam) && linesParam > 0 ? linesParam : 15, 200);

  log.info("Printing logs lines:", linesCount);

  const path: Optional<string> = await getLogFilePath();

  if (path) {
    log.info("Checking logs in:", chalk.yellow(path));

    const lines: string = await readLastLinesOfFile(path, linesCount);

    log.info("\n");

    console.info(lines);
  } else {
    log.info("No active logs found, exit");
  }
})();

async function getLogFilePath(): Promise<Optional<string>> {
  const username: string = os.userInfo().username.toLowerCase();

  const openXRayLogPath: string = path.resolve(GAME_LOGS_DIR, `openxray_${username}.log`);
  const baseXRayLogPath: string = path.resolve(GAME_LOGS_DIR, `xray_${username}.log`);

  if (!fs.existsSync(GAME_LOGS_DIR)) {
    log.info("Provided invalid game logs folder or log do not exist:", chalk.yellow(GAME_LOGS_DIR));

    return null;
  }

  if (fs.existsSync(GAME_BIN_DESCRIPTOR_DIR)) {
    const binDescriptor: Record<string, unknown> = await import(GAME_BIN_DESCRIPTOR_DIR);

    log.info(
      "Open x-ray engine usage detected:",
      chalk.yellow(`${binDescriptor.type} ${binDescriptor.version} ${binDescriptor.release}`)
    );

    if (fs.existsSync(openXRayLogPath)) {
      return openXRayLogPath;
    } else {
      log.warn("Using custom engine, but no logs for it found:", chalk.yellow(openXRayLogPath));

      return null;
    }
  }

  if (fs.existsSync(baseXRayLogPath)) {
    return baseXRayLogPath;
  } else {
    log.warn("No logs for engine found in:", chalk.yellow(openXRayLogPath));

    return null;
  }
}

import { default as assert } from "assert";
import * as cp from "child_process";
import { copyFileSync, existsSync, readdirSync, renameSync, unlinkSync, writeFileSync } from "fs";
import * as path from "path";

import { default as chalk } from "chalk";

import { TARGET_COMPRESS, TARGET_DIR, TARGET_GAME_DATA_DIR, TARGET_LOGS, XR_COMPRESS_PATH } from "#/globals";
import { createDirIfNoExisting, NodeLogger } from "#/utils";
import { deleteFileIfExists } from "#/utils/fs/delete_file_if_exists";

const log: NodeLogger = new NodeLogger("COMPRESS");

export interface ICompressParameters {
  verbose?: boolean;
}

/**
 * Perform compression with xrCompress utils.
 */
export function compress(parameters: ICompressParameters): void {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  log.info("XRF compress");
  log.debug("Current params:", JSON.stringify(parameters));

  assert(existsSync(TARGET_GAME_DATA_DIR), "Expected gamedata build directory to exist.");

  try {
    createDirIfNoExisting(TARGET_COMPRESS);
    copyConfig("fsgame.ltx");

    compressWithConfig("configs");

    collectLog();
    removeConfig("fsgame.ltx");
  } catch (error) {
    log.error("Failed to execute compression commands:", error);
  }
}

/**
 * Handle compression config with a separate xrCompress call.
 */
function compressWithConfig(configName: string): void {
  const configFileName: string = configName + ".ini";

  log.info("Starting compression for:", chalk.blue(configName));
  log.info("Current workdir:", chalk.yellowBright(process.cwd()));

  copyConfig(configFileName);

  const command: string = `${XR_COMPRESS_PATH} ${TARGET_GAME_DATA_DIR} -ltx ${configFileName}`;

  log.info("Execute:", chalk.blue(command));

  // Start working from target directory.
  const executionResult: Buffer = cp.execSync(command, {
    cwd: TARGET_DIR,
  });

  removeConfig(configFileName);

  // Move compressed files to compress dir.
  readdirSync(TARGET_DIR, { withFileTypes: true }).forEach((it) => {
    if (it.isFile() && it.name.startsWith("gamedata.pack_")) {
      const index: number = Number.parseInt(it.name.match(/\d+/)[0]);

      renameSync(path.resolve(TARGET_DIR, it.name), path.resolve(TARGET_COMPRESS, `${configName}.db${index}`));
    }
  });

  log.info("Compression finished for:", chalk.blue(configName));

  log.debug("XrCompress log:");
  log.debug(executionResult.toString());
}

/**
 * Remove config by name.
 */
function removeConfig(name: string): void {
  const fullPath: string = path.resolve(TARGET_DIR, name);

  if (existsSync(fullPath)) {
    unlinkSync(fullPath);
  }
}

/**
 * Create new LTX file for compression.
 */
function copyConfig(name: string): void {
  const from: string = path.resolve(__dirname, "configs", name);
  const to: string = path.resolve(TARGET_DIR, name);

  removeConfig(name);
  copyFileSync(from, to);
}

/**
 * Collect build detailed build log file.
 */
export function collectLog(): void {
  const fileLogPath: string = path.resolve(TARGET_LOGS, "xrf_compress.log");

  try {
    createDirIfNoExisting(TARGET_LOGS);
    deleteFileIfExists(fileLogPath);

    writeFileSync(fileLogPath, NodeLogger.LOG_FILE_BUFFER.join(""));

    log.info(chalk.blueBright("File log collected:"), chalk.yellowBright(fileLogPath), "\n");
  } catch (error) {
    log.error("Failed to collect log:", error);
  }
}

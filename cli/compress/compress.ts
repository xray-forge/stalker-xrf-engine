import { default as assert } from "assert";
import * as cp from "child_process";
import { copyFileSync, existsSync, readdirSync, readFileSync, renameSync, rmSync, unlinkSync, writeFileSync } from "fs";
import * as path from "path";

import { default as chalk } from "chalk";

import { default as config } from "#/compress/configs/compress.json";
import { TARGET_DATABASE_DIR, TARGET_DIR, TARGET_GAME_DATA_DIR, TARGET_LOGS_DIR, XR_COMPRESS_PATH } from "#/globals";
import { createDirIfNoExisting, NodeLogger, TimeTracker } from "#/utils";
import { deleteFileIfExists } from "#/utils/fs/delete_file_if_exists";

const log: NodeLogger = new NodeLogger("COMPRESS");

export interface ICompressParameters {
  include: "all" | Array<string>;
  verbose?: boolean;
  clean?: boolean;
}

/**
 * Perform compression with xrCompress utils.
 */
export function compress(parameters: ICompressParameters): void {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  const timeTracker: TimeTracker = new TimeTracker().start();

  log.info("XRF compress");
  log.debug("Current params:", JSON.stringify(parameters));

  if (parameters.clean) {
    log.info("Perform package cleanup:", chalk.yellowBright(TARGET_DATABASE_DIR));
    rmSync(TARGET_DATABASE_DIR, { recursive: true, force: true });
  }

  assert(existsSync(TARGET_GAME_DATA_DIR), "Expected gamedata build directory to exist.");

  if (parameters.include !== "all") {
    parameters.include.forEach((it) => {
      assert(
        config[it],
        `Expected include to list existing field, got '${it}'. Valid options: '${Object.keys(config).join(",")}'.`
      );
    });
  }

  try {
    timeTracker.addMark("COMPRESS_PREPARATION");

    createDirIfNoExisting(TARGET_DATABASE_DIR);
    copyConfig("fsgame.ltx");

    for (const [key, descriptor] of Object.entries(config)) {
      if (parameters.include === "all" || parameters.include.includes(key)) {
        compressWithConfig(key, {
          fast: Boolean(descriptor["fast"]),
          store: Boolean(descriptor["store"]),
          folders: descriptor.folders,
          files: descriptor.files,
        });

        timeTracker.addMark(`COMPRESS_${key.toUpperCase()}`);
      } else {
        timeTracker.addMark(`COMPRESS_${key.toUpperCase()}_SKIP`);
      }
    }

    removeConfig("fsgame.ltx");
    timeTracker.end();

    log.info("Successfully executed compress command, took:", timeTracker.getDuration() / 1000, "sec");
  } catch (error) {
    log.error("Failed to execute compression commands:", error);
  } finally {
    collectLog();
  }
}

/**
 * Handle compression config with a separate xrCompress call.
 */
function compressWithConfig(
  configName: string,
  { fast, store, folders, files }: { fast?: boolean; store?: boolean; files: Array<string>; folders: Array<string> }
): void {
  const configFileName: string = configName + ".ltx";

  log.info("Starting compression for:", chalk.blue(configName));
  log.info("Current workdir:", chalk.yellowBright(process.cwd()));

  log.info("Files:", chalk.blue(files.length));
  log.debug("Files:", chalk.yellow(JSON.stringify(files)));
  log.info("Folders:", chalk.blue(folders.length));
  log.debug("Folders:", chalk.yellow(JSON.stringify(JSON.stringify(folders))));

  /**
   * Create LTX compression config from template.
   */
  createLtxCompressionConfig(configFileName, { files, folders });

  const command: string = `${XR_COMPRESS_PATH} ${TARGET_GAME_DATA_DIR} -ltx ${configFileName} ${fast ? "-fast" : ""} ${
    store ? "-store" : ""
  }`;

  log.info("Execute:", chalk.blue(command));

  /**
   * Start xrCompress and set CWD to target dir.
   */
  cp.execSync(command, {
    cwd: TARGET_DIR,
    stdio: NodeLogger.IS_VERBOSE ? "inherit" : "ignore",
  });

  /**
   * Remove generated build ltx.
   */
  removeConfig(configFileName);

  /**
   * Move compressed DB files to target DB directory.
   */
  readdirSync(TARGET_DIR, { withFileTypes: true }).forEach((it) => {
    if (it.isFile() && it.name.startsWith("gamedata.pack_")) {
      const index: number = Number.parseInt(it.name.match(/\d+/)[0]);

      renameSync(path.resolve(TARGET_DIR, it.name), path.resolve(TARGET_DATABASE_DIR, `${configName}.db${index}`));
    }
  });

  log.info("Compression finished for:", chalk.yellow(configName));
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
 * Creat xrCompress generic template based on lists of files/folders.
 */
export function createLtxCompressionConfig(
  name: string,
  {
    files = [],
    folders = [],
  }: {
    folders: Array<string>;
    files: Array<string>;
  }
): void {
  const to: string = path.resolve(TARGET_DIR, name);

  if (existsSync(to)) {
    unlinkSync(to);
  }

  const ltxTemplate: string = "template.ltx";
  const ltxTemplatePath: string = path.resolve(__dirname, "configs", ltxTemplate);

  assert(existsSync(ltxTemplatePath), `Expected ltx template '${ltxTemplatePath}' to exist.`);

  const templateText: string = readFileSync(ltxTemplatePath).toString();
  const resultingConfig: string = templateText
    .replace(";$files$", files.join("\n"))
    .replace(";$folders$", folders.map((it) => `${it} = true`).join("\n"));

  log.debug("Creating LTX config:", name, to);
  log.debug("Created config:", "\n", resultingConfig);

  writeFileSync(to, resultingConfig);
}

/**
 * Collect build detailed build log file.
 */
export function collectLog(): void {
  const fileLogPath: string = path.resolve(TARGET_LOGS_DIR, "xrf_db_compress.log");

  try {
    createDirIfNoExisting(TARGET_LOGS_DIR);
    deleteFileIfExists(fileLogPath);

    writeFileSync(fileLogPath, NodeLogger.LOG_FILE_BUFFER.join(""));

    log.info(chalk.blueBright("File log collected:"), chalk.yellowBright(fileLogPath), "\n");
  } catch (error) {
    log.error("Failed to collect log:", error);
  }
}

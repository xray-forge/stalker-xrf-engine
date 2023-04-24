import { default as assert } from "assert";
import { cpSync, existsSync, rmSync } from "fs";
import * as path from "path";

import { default as chalk } from "chalk";

import { build } from "#/build/build";
import { compress } from "#/compress/compress";
import { default as config } from "#/config.json";
import { isValidEngine } from "#/engine/list_engines";
import {
  CLI_DIR,
  OPEN_XRAY_ENGINES_DIR,
  TARGET_DATABASE_DIR,
  TARGET_GAME_DATA_DIR,
  TARGET_GAME_PACKAGE_DIR,
} from "#/globals";
import { IPackParameters, WARNING_SIGN } from "#/pack/pack";
import { createDirIfNoExisting, NodeLogger, TimeTracker } from "#/utils";

const log: NodeLogger = new NodeLogger("PACK_GAME");

/**
 * Pack engine and gamedata into complete game, ensure everything works correctly.
 */
export async function packGame(parameters: IPackParameters): Promise<void> {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  try {
    log.info("Packaging new game:", chalk.blue(new Date().toLocaleString()));
    log.debug("Running with parameters:", parameters);

    const engine: string = String(parameters.engine || config.package.engine).trim();

    if (parameters.engine) {
      log.info("Using engine override:", chalk.blue(parameters.engine));
    } else {
      log.info("Using configured engine:", chalk.blue(engine));
    }

    if (parameters.optimize) {
      log.info("Using build with optimizations");
    } else {
      log.info("Using build without optimizations", WARNING_SIGN);
    }

    assert(isValidEngine(engine), `Expected engine to be valid, got '${engine}'.`);

    const timeTracker: TimeTracker = new TimeTracker().start();

    // If needed, proceed with full build and compression step.
    if (parameters.build) {
      log.info("Packaging from new assets, starting build");
      log.pushNewLine();

      await build({
        clean: true,
        assetOverrides: parameters.assetOverrides,
        verbose: parameters.verbose,
        luaLogs: !parameters.optimize,
        include: "all",
        exclude: [],
        filter: [],
      });

      log.info("Starting assets DB compress", "\n");

      await compress({ clean: true, verbose: parameters.verbose, include: "all" });
    } else {
      log.info("Packaging from already built assets", WARNING_SIGN);
    }

    if (parameters.clean) {
      log.info("Perform package cleanup:", chalk.yellowBright(TARGET_GAME_PACKAGE_DIR));
      rmSync(TARGET_GAME_PACKAGE_DIR, { recursive: true, force: true });
      timeTracker.addMark("PACKAGE_CLEANUP");
    } else {
      log.info("Skip package cleanup:", WARNING_SIGN);
      timeTracker.addMark("PACKAGE_CLEANUP_SKIP");
    }

    copyGameEngine(engine);
    timeTracker.addMark("PACKAGE_GAME_BIN");

    copyDatabaseAssets();
    timeTracker.addMark("PACKAGE_DB");

    copyGamedataAssets();
    timeTracker.addMark("PACKAGE_GAMEDATA");

    copyRootAssets();
    timeTracker.addMark("PACKAGE_CONFIGS");

    timeTracker.end();

    log.info("Successfully executed pack command, took:", timeTracker.getDuration() / 1000, "sec");
    log.info("Check game build at:", chalk.yellowBright(TARGET_GAME_PACKAGE_DIR), "\n");
  } catch (error) {
    log.error("Failed to execute packaging command:", error);
  }
}

/**
 * Copy engine binaries for package.
 */
function copyGameEngine(engine: string): void {
  const destinationPath: string = path.resolve(TARGET_GAME_PACKAGE_DIR, "bin");
  const enginePath: string = path.resolve(OPEN_XRAY_ENGINES_DIR, engine, "bin");
  const engineDescriptorPath: string = path.resolve(destinationPath, "bin.json");

  log.info("Copy game engine binaries:", chalk.yellow(enginePath), "->", chalk.yellowBright(destinationPath));
  log.info("Using game engine:", chalk.blue(config.package.engine));
  log.info("Engine path:", chalk.yellowBright(enginePath));

  assert(existsSync(enginePath), "Expected engine directory to exist.");

  createDirIfNoExisting(destinationPath);
  cpSync(enginePath, destinationPath, { recursive: true });

  /**
   * Remove bin.json with engine description.
   */
  if (existsSync(engineDescriptorPath)) {
    rmSync(engineDescriptorPath);
  }
}

/**
 * Copy gamedata assets needed for the game build.
 */
function copyGamedataAssets(): void {
  const destinationPath: string = path.resolve(TARGET_GAME_PACKAGE_DIR, "gamedata");

  log.info("Copy gamedata assets:", chalk.yellow(TARGET_GAME_DATA_DIR), "->", chalk.yellowBright(destinationPath));

  assert(existsSync(TARGET_GAME_DATA_DIR), "Expected gamedata directory to exist.");

  createDirIfNoExisting(destinationPath);

  config.package.gamedata.forEach((it) => {
    log.debug("CP:", it);
    cpSync(path.resolve(TARGET_GAME_DATA_DIR, it), path.resolve(destinationPath, it), { recursive: true });
  });
}

/**
 * Copy game resources / archives for database.
 */
function copyDatabaseAssets(): void {
  const destinationPath: string = path.resolve(TARGET_GAME_PACKAGE_DIR, "db");

  log.info("Copy game archives:", chalk.yellow(TARGET_DATABASE_DIR), "->", chalk.yellowBright(destinationPath));

  assert(existsSync(TARGET_DATABASE_DIR), "Expected compressed db directory to exist.");

  createDirIfNoExisting(destinationPath);

  log.debug("CP:", TARGET_DATABASE_DIR);
  cpSync(TARGET_DATABASE_DIR, destinationPath, { recursive: true });
}

/**
 * Copy game configs for root folder.
 * Default graphics settings and FS mappings.
 */
function copyRootAssets(): void {
  log.info("Copy static game root assets");

  for (const asset of config.package.rootAssets) {
    const fromPath: string = path.resolve(CLI_DIR, asset);
    const toPath: string = path.resolve(TARGET_GAME_PACKAGE_DIR, path.basename(fromPath));

    log.info("Copy game root asset:", chalk.yellow(fromPath), "->", chalk.yellowBright(toPath));

    assert(existsSync(fromPath), `Expected '${asset}' to exist at '${fromPath}'.`);

    log.debug("CP:", toPath);
    cpSync(fromPath, toPath);
  }
}

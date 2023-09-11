import { default as assert } from "assert";
import { cpSync, existsSync, rmSync } from "fs";
import * as path from "path";

import { blue, yellow, yellowBright } from "chalk";

import { build } from "#/build/build";
import { default as config } from "#/config.json";
import { isValidEngine } from "#/engine/list_engines";
import { OPEN_XRAY_ENGINES_DIR, TARGET_GAME_DATA_DIR, TARGET_MOD_PACKAGE_DIR, WARNING_SIGN } from "#/globals";
import { IPackParameters } from "#/pack/pack";
import { createDirIfNoExisting, NodeLogger, TimeTracker } from "#/utils";

const log: NodeLogger = new NodeLogger("PACK_MOD");

/**
 * Pack engine and gamedata into separate mod pack, ensure everything works correctly.
 */
export async function packMod(parameters: IPackParameters): Promise<void> {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  try {
    log.info("Packaging new mod:", blue(new Date().toLocaleString()));
    log.debug("Running with parameters:", parameters);

    const engine: string = String(parameters.engine || config.package.engine).trim();

    if (parameters.engine) {
      log.info("Using engine override:", blue(parameters.engine));
    } else {
      log.info("Using configured engine:", blue(engine));
    }

    if (parameters.optimize) {
      log.info("Using build with optimizations");
    } else {
      log.info("Using build without optimizations", WARNING_SIGN);
    }

    assert(isValidEngine(engine), `Expected engine to be valid, got '${engine}'.`);

    const timeTracker: TimeTracker = new TimeTracker().start();
    const isBuildRequired: boolean = parameters.build;

    if (parameters.clean) {
      log.info("Perform package cleanup:", yellowBright(TARGET_MOD_PACKAGE_DIR));
      rmSync(TARGET_MOD_PACKAGE_DIR, { recursive: true, force: true });
      timeTracker.addMark("PACKAGE_CLEANUP");
    } else {
      log.info("Skip package cleanup:", WARNING_SIGN);
      timeTracker.addMark("PACKAGE_CLEANUP_SKIP");
    }

    // If needed, proceed with full build and compression step.
    if (isBuildRequired) {
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
    } else {
      log.info("Packaging from already built assets", WARNING_SIGN);
    }

    if (parameters.skipEngine) {
      log.info("Skip engines in mod package");
    } else {
      copyGameEngine(engine);
      timeTracker.addMark("PACKAGE_GAME_BIN");
    }

    copyGamedataAssets();
    timeTracker.addMark("PACKAGE_GAMEDATA");

    timeTracker.end();

    log.info("Successfully executed pack command, took:", timeTracker.getDuration() / 1000, "sec");
    log.info("Check mod build at:", yellowBright(TARGET_MOD_PACKAGE_DIR), "\n");
  } catch (error) {
    log.error("Failed to execute packaging command:", error);
  }
}

/**
 * Copy engine binaries for package.
 */
function copyGameEngine(engine: string): void {
  const destinationPath: string = path.resolve(TARGET_MOD_PACKAGE_DIR, "bin");
  const enginePath: string = path.resolve(OPEN_XRAY_ENGINES_DIR, engine, "bin");
  const engineDescriptorPath: string = path.resolve(destinationPath, "bin.json");

  log.info("Copy game engine binaries:", yellow(enginePath), "->", yellowBright(destinationPath));
  log.info("Using game engine:", blue(config.package.engine));
  log.info("Engine path:", yellowBright(enginePath));

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
  const destinationPath: string = path.resolve(TARGET_MOD_PACKAGE_DIR, "gamedata");

  log.info("Copy gamedata assets:", yellow(TARGET_GAME_DATA_DIR), "->", yellowBright(destinationPath));

  assert(existsSync(TARGET_GAME_DATA_DIR), "Expected gamedata directory to exist.");

  createDirIfNoExisting(destinationPath);

  log.debug("CP:", yellow(TARGET_GAME_DATA_DIR), "->", yellowBright(destinationPath));
  cpSync(TARGET_GAME_DATA_DIR, destinationPath, { recursive: true });
}

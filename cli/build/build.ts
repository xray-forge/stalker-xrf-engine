import * as fs from "fs";
import * as process from "process";

import { default as chalk } from "chalk";

import { areNoBuildPartsParameters, BUILD_ARGS, IBuildParameters, parseBuildParameters } from "#/build/build_params";
import {
  buildDynamicConfigs,
  buildDynamicScripts,
  buildDynamicUi,
  buildMeta,
  buildResourcesStatics,
  buildStaticConfigs,
  collectLog,
} from "#/build/steps";
import { buildTranslations } from "#/build/steps/translations";
import { buildStaticUi } from "#/build/steps/ui_statics";
import { TARGET_GAME_DATA_DIR } from "#/globals/paths";
import { NodeLogger, TimeTracker } from "#/utils";

import { default as pkg } from "#/../package.json";

const log: NodeLogger = new NodeLogger("BUILD_ALL");

/**
 * Main workflow for building game assets.
 * Builds separate parts of gamedata and collects log with metadata information.
 */
(async function buildMod(): Promise<void> {
  const parameters: IBuildParameters = parseBuildParameters(process.argv);
  const timeTracker: TimeTracker = new TimeTracker().start();

  NodeLogger.IS_FILE_ENABLED = true;
  NodeLogger.IS_VERBOSE = parameters[BUILD_ARGS.VERBOSE];

  try {
    log.info("XRF build:", chalk.green(pkg?.name), chalk.blue(new Date().toLocaleString()));
    log.debug("XRF params:", JSON.stringify(parameters));

    /**
     * Verify parameters integrity.
     */
    if (areNoBuildPartsParameters(parameters)) {
      if (parameters[BUILD_ARGS.CLEAN]) {
        log.info("Perform cleanup only:", chalk.yellowBright(TARGET_GAME_DATA_DIR));
        fs.rmSync(TARGET_GAME_DATA_DIR, { recursive: true, force: true });

        return;
      } else {
        return log.warn("Empty build parameters specified, consider passing '--all' or desired modules");
      }
    }

    /**
     * Inform about logs strip step.
     */
    if (parameters[BUILD_ARGS.NO_LUA_LOGS]) {
      log.info("Lua logger is disabled");
    }

    /**
     * Apply destination clean.
     */
    if (parameters[BUILD_ARGS.CLEAN]) {
      log.info("Perform target cleanup:", chalk.yellowBright(TARGET_GAME_DATA_DIR));
      fs.rmSync(TARGET_GAME_DATA_DIR, { recursive: true, force: true });
      timeTracker.addMark("BUILD_CLEANUP");
    } else {
      timeTracker.addMark("SKIP_CLEANUP");
    }

    /**
     * Build game scripts.
     */
    if (parameters[BUILD_ARGS.SCRIPTS]) {
      await buildDynamicScripts();
      timeTracker.addMark("BUILT_DYNAMIC_SCRIPTS");
    } else {
      log.info("Scripts build steps skipped");
      timeTracker.addMark("SKIP_SCRIPTS");
    }

    /**
     * Build game XML forms from JSX / copy static XML.
     */
    if (parameters[BUILD_ARGS.UI]) {
      await buildDynamicUi();
      timeTracker.addMark("BUILT_DYNAMIC_UI");
      await buildStaticUi();
      timeTracker.addMark("BUILT_STATIC_UI");
    } else {
      log.info("UI build steps skipped");
      timeTracker.addMark("SKIP_UI");
    }

    /**
     * Build game LTX configs / copy static LTX.
     */
    if (parameters[BUILD_ARGS.CONFIGS]) {
      await buildDynamicConfigs();
      timeTracker.addMark("BUILT_DYNAMIC_CONFIGS");
      await buildStaticConfigs();
      timeTracker.addMark("BUILT_STATIC_CONFIGS");
    } else {
      log.info("Configs build steps skipped");
      timeTracker.addMark("SKIP_CONFIGS");
    }

    /**
     * Build game translations / copy static XML.
     */
    if (parameters[BUILD_ARGS.TRANSLATIONS]) {
      await buildTranslations();
      timeTracker.addMark("BUILT_TRANSLATIONS");
    } else {
      log.info("Translations build steps skipped");
      timeTracker.addMark("SKIP_TRANSLATIONS");
    }

    /**
     * Copy static assets from resources directories.
     */
    if (parameters[BUILD_ARGS.RESOURCES]) {
      await buildResourcesStatics();
      timeTracker.addMark("BUILT_STATIC_RESOURCES");
    } else {
      log.info("Static resources build steps skipped");
      timeTracker.addMark("SKIP_RESOURCES");
    }

    timeTracker.end();

    /**
     * Build metadata.json descriptor.
     */
    await buildMeta({ meta: pkg, timeTracker });

    log.info("Successfully executed build command, took:", timeTracker.getDuration() / 1000, "sec");
  } catch (error) {
    log.error("Build fail:", error);
    timeTracker.end();
  } finally {
    await collectLog();
  }
})();

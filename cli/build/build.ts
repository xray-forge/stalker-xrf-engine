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
import { buildStaticTranslations } from "#/build/steps/translations_statics";
import { buildStaticUi } from "#/build/steps/ui_statics";
import { TARGET_GAME_DATA_DIR } from "#/globals";
import { NodeLogger, TimeTracker } from "#/utils";

import { default as pkg } from "#/../package.json";

const log: NodeLogger = new NodeLogger("BUILD_ALL");

/**
 * todo;
 */
(async function buildMod(): Promise<void> {
  const parameters: IBuildParameters = parseBuildParameters(process.argv);
  const timeTracker: TimeTracker = new TimeTracker().start();

  NodeLogger.IS_FILE_ENABLED = true;
  NodeLogger.IS_VERBOSE = parameters[BUILD_ARGS.VERBOSE];

  try {
    log.info("XRTS build:", chalk.green(pkg?.name), chalk.blue(new Date().toLocaleString()));
    log.debug("XRTS params:", JSON.stringify(parameters));

    if (areNoBuildPartsParameters(parameters)) {
      if (parameters[BUILD_ARGS.CLEAN]) {
        log.info("Perform cleanup only:", chalk.yellowBright(TARGET_GAME_DATA_DIR));
        fs.rmSync(TARGET_GAME_DATA_DIR, { recursive: true, force: true });

        return;
      } else {
        return log.warn("Empty build parameters specified, consider passing '--all' or desired modules");
      }
    }

    if (parameters[BUILD_ARGS.NO_LUA_LOGS]) {
      log.info("Lua logger is disabled");
    }

    if (parameters[BUILD_ARGS.CLEAN]) {
      log.info("Perform target cleanup:", chalk.yellowBright(TARGET_GAME_DATA_DIR));
      fs.rmSync(TARGET_GAME_DATA_DIR, { recursive: true, force: true });
      timeTracker.addMark("BUILD_CLEANUP");
    } else {
      timeTracker.addMark("SKIP_CLEANUP");
    }

    if (parameters[BUILD_ARGS.SCRIPTS]) {
      await buildDynamicScripts();
      timeTracker.addMark("BUILT_DYNAMIC_SCRIPTS");
    } else {
      log.info("Scripts build steps skipped");
      timeTracker.addMark("SKIP_SCRIPTS");
    }

    if (parameters[BUILD_ARGS.UI]) {
      await buildDynamicUi();
      timeTracker.addMark("BUILT_DYNAMIC_UI");
      await buildStaticUi();
      timeTracker.addMark("BUILT_STATIC_UI");
    } else {
      log.info("UI build steps skipped");
      timeTracker.addMark("SKIP_UI");
    }

    if (parameters[BUILD_ARGS.CONFIGS]) {
      await buildDynamicConfigs();
      timeTracker.addMark("BUILT_DYNAMIC_CONFIGS");
      await buildStaticConfigs();
      timeTracker.addMark("BUILT_STATIC_CONFIGS");
    } else {
      log.info("Configs build steps skipped");
      timeTracker.addMark("SKIP_CONFIGS");
    }

    if (parameters[BUILD_ARGS.TRANSLATIONS]) {
      await buildStaticTranslations();
      timeTracker.addMark("BUILT_STATIC_TRANSLATIONS");
    } else {
      log.info("Translations build steps skipped");
      timeTracker.addMark("SKIP_TRANSLATIONS");
    }

    if (parameters[BUILD_ARGS.RESOURCES]) {
      await buildResourcesStatics();
      timeTracker.addMark("BUILT_STATIC_RESOURCES");
    } else {
      log.info("Static resources build steps skipped");
      timeTracker.addMark("SKIP_RESOURCES");
    }

    timeTracker.end();

    await buildMeta({ meta: pkg, timeTracker });

    log.info("Successfully executed build command, took:", timeTracker.getDuration() / 1000, "sec");
  } catch (error) {
    log.error("Build fail:", error);
    timeTracker.end();
  } finally {
    await collectLog();
  }
})();

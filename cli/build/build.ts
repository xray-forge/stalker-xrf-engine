import * as fs from "fs";

import { default as chalk } from "chalk";

import { default as pkg } from "#/../package.json";
import {
  collectLog,
  buildDynamicUi,
  buildStaticConfigs,
  buildDynamicConfigs,
  buildDynamicScripts,
  buildMeta,
  buildResourcesStatics,
  buildScriptsStatics
} from "#/build/steps";
import { buildStaticTranslations } from "#/build/steps/translations_statics";
import { buildStaticUi } from "#/build/steps/ui_statics";
import { TARGET_GAME_DATA_DIR } from "#/globals";
import { NodeLogger, TimeTracker } from "#/utils";

export const BUILD_PARAMS = {
  IS_CLEAN_BUILD: process.argv.includes("--clean"),
  IS_LUA_LOGGER_DISABLED: process.argv.includes("--no-lua-logs"),
  IS_VERBOSE_BUILD: process.argv.includes("--verbose"),
  ARE_STATIC_RESOURCES_ENABLED: !process.argv.includes("--no-resources"),
  ARE_UI_RESOURCES_ENABLED: !process.argv.includes("--no-ui"),
  ARE_SCRIPT_RESOURCES_ENABLED: !process.argv.includes("--no-scripts"),
  ARE_CONFIG_RESOURCES_ENABLED: !process.argv.includes("--no-configs"),
  ARE_TRANSLATION_RESOURCES_ENABLED: !process.argv.includes("--no-translations")
};

NodeLogger.IS_FILE_ENABLED = true;
NodeLogger.IS_VERBOSE = BUILD_PARAMS.IS_VERBOSE_BUILD;

const log: NodeLogger = new NodeLogger("BUILD_ALL");

(async function buildMod(): Promise<void> {
  const timeTracker: TimeTracker = new TimeTracker().start();

  try {
    log.info("XRTS build:", chalk.green(pkg?.name), chalk.blue(new Date().toLocaleString()));

    if (BUILD_PARAMS.IS_CLEAN_BUILD) {
      log.info("Perform target cleanup:", chalk.yellowBright(TARGET_GAME_DATA_DIR));
      fs.rmSync(TARGET_GAME_DATA_DIR, { recursive: true, force: true });
      timeTracker.addMark("BUILD_CLEANUP");
    } else {
      log.info("Do not perform target cleanup");
      timeTracker.addMark("SKIP_CLEANUP");
    }

    if (BUILD_PARAMS.ARE_SCRIPT_RESOURCES_ENABLED) {
      await buildDynamicScripts();
      timeTracker.addMark("BUILT_DYNAMIC_SCRIPTS");
      await buildScriptsStatics();
      timeTracker.addMark("BUILT_STATIC_SCRIPTS");
    } else {
      log.info("Scripts build steps skipped");
      timeTracker.addMark("SKIP_SCRIPTS");
    }

    if (BUILD_PARAMS.ARE_UI_RESOURCES_ENABLED) {
      await buildDynamicUi();
      timeTracker.addMark("BUILT_DYNAMIC_UI");
      await buildStaticUi();
      timeTracker.addMark("BUILT_STATIC_UI");
    } else {
      log.info("UI build steps skipped");
      timeTracker.addMark("SKIP_UI");
    }

    if (BUILD_PARAMS.ARE_CONFIG_RESOURCES_ENABLED) {
      await buildDynamicConfigs();
      timeTracker.addMark("BUILT_DYNAMIC_CONFIGS");
      await buildStaticConfigs();
      timeTracker.addMark("BUILT_STATIC_CONFIGS");
    } else {
      log.info("Configs build steps skipped");
      timeTracker.addMark("SKIP_CONFIGS");
    }

    if (BUILD_PARAMS.ARE_TRANSLATION_RESOURCES_ENABLED) {
      await buildStaticTranslations();
      timeTracker.addMark("BUILT_STATIC_TRANSLATIONS");
    } else {
      log.info("Translations build steps skipped");
      timeTracker.addMark("SKIP_TRANSLATIONS");
    }

    if (BUILD_PARAMS.ARE_STATIC_RESOURCES_ENABLED) {
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

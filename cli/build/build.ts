import * as fs from "fs";

import { default as chalk } from "chalk";

import { default as pkg } from "#/../package.json";
import { TARGET_GAME_DATA_DIR } from "#/build/globals";
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
import { NodeLogger, TimeTracker } from "#/utils";

export const IS_CLEAN_BUILD: boolean = process.argv.includes("--clean");
export const IS_LUA_LOGGER_DISABLED: boolean = process.argv.includes("--no-lua-logger");
export const IS_VERBOSE_BUILD: boolean = process.argv.includes("--verbose");
export const ARE_STATIC_RESOURCES_ENABLED: boolean = !process.argv.includes("--no-resources");
export const ARE_UI_RESOURCES_ENABLED: boolean = !process.argv.includes("--no-ui");
export const ARE_SCRIPT_RESOURCES_ENABLED: boolean = !process.argv.includes("--no-scripts");
export const ARE_CONFIG_RESOURCES_ENABLED: boolean = !process.argv.includes("--no-configs");
export const ARE_TRANSLATION_RESOURCES_ENABLED: boolean = !process.argv.includes("--no-translations");

NodeLogger.IS_FILE_ENABLED = true;
NodeLogger.IS_VERBOSE = IS_VERBOSE_BUILD;

const log: NodeLogger = new NodeLogger("BUILD_ALL");

(async function buildMod(): Promise<void> {
  const timeTracker: TimeTracker = new TimeTracker().start();

  try {
    log.info("XRTS build:", chalk.green(pkg?.name), chalk.blue(new Date().toLocaleString()));

    if (IS_CLEAN_BUILD) {
      log.info("Perform target cleanup");
      fs.rmSync(TARGET_GAME_DATA_DIR, { recursive: true, force: true });
      timeTracker.addMark("BUILD_CLEANUP");
    } else {
      log.info("Do not perform target cleanup");
      timeTracker.addMark("SKIP_CLEANUP");
    }

    if (ARE_SCRIPT_RESOURCES_ENABLED) {
      await buildDynamicScripts();
      timeTracker.addMark("BUILT_DYNAMIC_SCRIPTS");
      await buildScriptsStatics();
      timeTracker.addMark("BUILT_STATIC_SCRIPTS");
    } else {
      log.info("Scripts build steps skipped");
      timeTracker.addMark("SKIP_SCRIPTS");
    }

    if (ARE_UI_RESOURCES_ENABLED) {
      await buildDynamicUi();
      timeTracker.addMark("BUILT_DYNAMIC_UI");
      await buildStaticUi();
      timeTracker.addMark("BUILT_STATIC_UI");
    } else {
      log.info("UI build steps skipped");
      timeTracker.addMark("SKIP_UI");
    }

    if (ARE_CONFIG_RESOURCES_ENABLED) {
      await buildDynamicConfigs();
      timeTracker.addMark("BUILT_DYNAMIC_CONFIGS");
      await buildStaticConfigs();
      timeTracker.addMark("BUILT_STATIC_CONFIGS");
    } else {
      log.info("Configs build steps skipped");
      timeTracker.addMark("SKIP_CONFIGS");
    }

    if (ARE_TRANSLATION_RESOURCES_ENABLED) {
      await buildStaticTranslations();
      timeTracker.addMark("BUILT_STATIC_TRANSLATIONS");
    } else {
      log.info("Translations build steps skipped");
      timeTracker.addMark("SKIP_TRANSLATIONS");
    }

    if (ARE_STATIC_RESOURCES_ENABLED) {
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

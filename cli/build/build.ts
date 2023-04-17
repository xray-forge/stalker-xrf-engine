import * as fs from "fs";

import { default as chalk } from "chalk";

import { IBuildCommandParameters } from "#/build/run";
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
 * todo;
 */
export enum EBuildTarget {
  CONFIGS = "configs",
  RESOURCES = "resources",
  SCRIPTS = "scripts",
  TRANSLATIONS = "translations",
  UI = "ui",
}

/**
 * Main workflow for building game assets.
 * Builds separate parts of gamedata and collects log with metadata information.
 */
export async function build(parameters: IBuildCommandParameters): Promise<void> {
  const timeTracker: TimeTracker = new TimeTracker().start();
  const buildTargets: Array<EBuildTarget> = getBuildTargets(parameters);

  NodeLogger.IS_FILE_ENABLED = true;
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  try {
    log.info("XRF build:", chalk.green(pkg?.name), chalk.blue(new Date().toLocaleString()));
    log.debug("XRF params:", JSON.stringify(parameters));
    log.debug("XRF targets:", buildTargets);

    /**
     * Inform about logs strip step.
     */
    if (!parameters.luaLogs) {
      log.info("Lua logger is disabled, strip all calls from resulting LUA bundle");
    }

    /**
     * Apply destination clean.
     */
    if (parameters.clean) {
      log.info("Perform target cleanup:", chalk.yellowBright(TARGET_GAME_DATA_DIR));
      fs.rmSync(TARGET_GAME_DATA_DIR, { recursive: true, force: true });
      timeTracker.addMark("BUILD_CLEANUP");
    } else {
      timeTracker.addMark("SKIP_CLEANUP");
    }

    /**
     * Build game scripts.
     */
    if (buildTargets.includes(EBuildTarget.SCRIPTS)) {
      await buildDynamicScripts();
      timeTracker.addMark("BUILT_DYNAMIC_SCRIPTS");
    } else {
      log.info("Scripts build steps skipped");
      timeTracker.addMark("SKIP_SCRIPTS");
    }

    /**
     * Build game XML forms from JSX / copy static XML.
     */
    if (buildTargets.includes(EBuildTarget.UI)) {
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
    if (buildTargets.includes(EBuildTarget.CONFIGS)) {
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
    if (buildTargets.includes(EBuildTarget.TRANSLATIONS)) {
      await buildTranslations();
      timeTracker.addMark("BUILT_TRANSLATIONS");
    } else {
      log.info("Translations build steps skipped");
      timeTracker.addMark("SKIP_TRANSLATIONS");
    }

    /**
     * Copy static assets from resources directories.
     */
    if (buildTargets.includes(EBuildTarget.RESOURCES)) {
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
}

/**
 * Get build targets from arguments.
 */
export function getBuildTargets(parameters: IBuildCommandParameters): Array<EBuildTarget> {
  const targets: Array<EBuildTarget> =
    (parameters.include === "all" ? Object.values(EBuildTarget) : parameters.include) || [];

  if (Array.isArray(parameters.exclude)) {
    parameters.exclude.forEach((it) => targets.splice(targets.indexOf(it), 1));
  }

  return targets;
}

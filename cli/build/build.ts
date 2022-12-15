import * as fs from "fs";

import { collectLog } from "#/build/build_collect_log";
import { buildConfigsStatics } from "#/build/build_configs_statics";
import { TARGET_GAME_DATA_DIR } from "#/build/build_globals";
import { buildLuaScripts } from "#/build/build_lua_scripts";
import { buildMeta } from "#/build/build_meta";
import { buildResourcesStatics } from "#/build/build_resources_statics";
import { buildScriptsStatics } from "#/build/build_scripts_statics";
import { Logger } from "#/utils";

const log: Logger = new Logger("BUILD_ALL");

const isCleanBuild: boolean = process.argv.includes("--clean");
const isBuildResourcesEnabled: boolean = !process.argv.includes("--no-resources");

Logger.IS_FILE_ENABLED = true;

(async function buildMod(): Promise<void> {
  const startedAt: number = Date.now();

  if (isCleanBuild) {
    log.info("Perform target cleanup");
    fs.rmSync(TARGET_GAME_DATA_DIR, { recursive: true, force: true });
  }

  log.info("Preparing mod build");

  await buildLuaScripts();
  await buildScriptsStatics();
  await buildConfigsStatics();

  if (isBuildResourcesEnabled) {
    await buildResourcesStatics();
  } else {
    log.info("Resources build steps skipped");
  }

  await buildMeta();

  log.info("Successfully executed build command, took:", (Date.now() - startedAt) / 1000, "sec");

  await collectLog();
})();

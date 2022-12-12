import * as fs from "fs";

import { Logger } from "../utils";

import { buildConfigsStatics } from "./build_configs_statics";
import { TARGET_GAME_DATA_DIR } from "./build_globals";
import { buildLuaScripts } from "./build_lua_scripts";
import { buildResourcesStatics } from "./build_resources_statics";
import { buildScriptsStatics } from "./build_scripts_statics";

const log: Logger = new Logger("BUILD_ALL");

const isCleanBuild: boolean = process.argv.includes("--clean");
const isBuildResourcesEnabled: boolean = !process.argv.includes("--no-resources");

(async function buildMod() {
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

  log.info("Successfully executed build command, took:", (Date.now() - startedAt) / 1000, "sec");
})();

import * as path from "path";

import * as tstl from "typescript-to-lua";

import { TARGET_GAME_DATA_DIR } from "#/build/build_globals";
import { Logger, replaceExtensionsInDir } from "#/utils";

const log: Logger = new Logger("BUILD_LUA_SCRIPTS");

export async function buildLuaScripts(): Promise<void> {
  const result = tstl.transpileProject(path.resolve(__dirname, "./tsconfig.scripts.json"), {
    noHeader: true
    // Issues of builder: breaks module resolution
    // extension: "script"
  });

  if (result.diagnostics?.length) {
    log.info("Lua build diagnostics:");

    result.diagnostics.forEach((it) => log.warn("Lua issue:", it.category, it.messageText));
  }

  log.info("Built lua scripts");

  await replaceExtensionsInDir(TARGET_GAME_DATA_DIR, "lua", "script");

  log.info("Renamed lua scripts");
}

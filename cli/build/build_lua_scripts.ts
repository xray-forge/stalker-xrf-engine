import * as path from "path";

import * as tstl from "typescript-to-lua";

import { Logger } from "../utils";

const log: Logger = new Logger("BUILD_LUA_SCRIPTS");

export async function buildLuaScripts(): Promise<void> {
  const result = tstl.transpileProject(path.resolve(__dirname, "./tsconfig.scripts.json"), {
    noHeader: true,
    extension: ".script"
  });

  if (result.diagnostics?.length) {
    log.info("Lua build diagnostics:");

    result.diagnostics.forEach((it) => log.warn("Lua issue:", it.category, it.messageText));
  }

  log.info("Built lua scripts");
}

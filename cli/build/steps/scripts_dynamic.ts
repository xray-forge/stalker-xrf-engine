import { blueBright, red, yellow, yellowBright } from "chalk";
import * as tstl from "typescript-to-lua";

import { BUILD_LUA_TSCONFIG } from "#/globals/paths";
import { NodeLogger } from "#/utils/logging";

const log: NodeLogger = new NodeLogger("BUILD_LUA_SCRIPTS");

/**
 * Transform typescript codebase to lua scripts and replace .lua with .script extensions.
 */
export async function buildDynamicScripts(): Promise<void> {
  log.info(blueBright("Build lua scripts"));

  const startedAt: number = Date.now();
  const result = tstl.transpileProject(BUILD_LUA_TSCONFIG, {
    noHeader: true,
    tstlVerbose: false,
  });

  if (result.diagnostics?.length) {
    log.warn("Lua build issues:", result.diagnostics.length);

    result.diagnostics.forEach((it) => {
      let errorLineStartPosition: number = it.start;
      let errorLineStopPosition: number = it.start + it.length;

      while (it.file.text[errorLineStartPosition - 1] !== "\n" && errorLineStartPosition > 0) {
        errorLineStartPosition -= 1;
      }

      while (it.file.text[errorLineStopPosition + 1] !== "\n" && errorLineStopPosition < it.file.text.length) {
        errorLineStopPosition += 1;
      }

      log.error(
        red("Lua issue:"),
        it.code,
        it.category,
        yellowBright(it.file.fileName),
        `"${it.file.text.slice(errorLineStartPosition, errorLineStopPosition).trim()}"`,
        red(it.messageText)
      );
    });

    throw new Error(
      `Lua transpiling failed, got ${result.diagnostics.length} lua issues. Use ${yellow(
        "'npm run typecheck'"
      )} for investigation.`
    );
  }

  log.info("Built lua scripts:", (Date.now() - startedAt) / 1000, "sec");
}

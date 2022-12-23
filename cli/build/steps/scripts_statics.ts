import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";

import { default as chalk } from "chalk";

import { GAME_DATA_SCRIPTS_DIR, TARGET_GAME_DATA_SCRIPTS_DIR } from "#/build/globals";
import { NodeLogger, readDirContent } from "#/utils";

const log: NodeLogger = new NodeLogger("BUILD_SCRIPT_STATICS");

export async function buildScriptsStatics(): Promise<void> {
  log.info(chalk.blueBright("Copy raw scripts"));

  function collectStaticScripts(acc: Array<[string, string]>, it: Array<string> | string): Array<[string, string]> {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectStaticScripts(acc, nested));
    } else if (String(it).endsWith(".script")) {
      const relativePath: string = it.slice(GAME_DATA_SCRIPTS_DIR.length);

      acc.push([it, path.join(TARGET_GAME_DATA_SCRIPTS_DIR, relativePath)]);
    }

    return acc;
  }

  const rawScripts: Array<[string, string]> = (await readDirContent(GAME_DATA_SCRIPTS_DIR)).reduce(
    collectStaticScripts,
    []
  );

  if (rawScripts.length > 0) {
    log.info("Detected static scripts");

    /**
     * Sync way for folder creation when needed.
     */
    rawScripts.forEach(([from, to]) => {
      const targetDir: string = path.dirname(to);

      if (!fs.existsSync(targetDir)) {
        log.debug("MKDIR dir:", chalk.yellow(targetDir));
        fs.mkdirSync(targetDir, { recursive: true });
      }
    });

    await Promise.all(
      rawScripts.map(([from, to]) => {
        log.debug("CP:", chalk.yellow(to));

        return fsPromises.copyFile(from, to);
      })
    );

    log.info("Scripts copied:", rawScripts.length);
  } else {
    log.info("No raw scripts for copy found");
  }
}

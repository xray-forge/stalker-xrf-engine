import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";

import { Logger, readDirContent } from "../utils";

import { GAME_DATA_SCRIPTS_DIR, TARGET_GAME_DATA_SCRIPTS_DIR } from "./build_globals";

const log: Logger = new Logger("BUILD_SCRIPT_STATICS");

export async function buildScriptsStatics(): Promise<void> {
  log.info("Copy raw lua scripts");

  function collectLua(acc: Array<[string, string]>, it: Array<string> | string): Array<[string, string]> {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectLua(acc, nested));
    } else if (String(it).endsWith(".script")) {
      const relativePath: string = it.slice(GAME_DATA_SCRIPTS_DIR.length);

      acc.push([ it, path.join(TARGET_GAME_DATA_SCRIPTS_DIR, relativePath) ]);
    }

    return acc;
  }

  const rawScripts: Array<[string, string]> = (await readDirContent(GAME_DATA_SCRIPTS_DIR)).reduce(collectLua, []);

  if (rawScripts.length > 0) {
    log.info("Found lua scripts:", rawScripts.length);
    log.info("Raw lua scripts cope success");

    /**
     * Sync way for folder creation when needed.
     */
    rawScripts.forEach(([ from, to ]) => {
      const targetDir: string = path.dirname(to);

      if (!fs.existsSync(targetDir)) {
        log.info("Create lua scripts dir:", targetDir);
        fs.mkdirSync(targetDir, { recursive: true });
      }
    });

    await Promise.all(
      rawScripts.map(([ from, to ]) => {
        log.info("Create lua script:", to);

        return fsPromises.copyFile(from, to);
      })
    );

    log.info(rawScripts.length, "scripts processed");
  } else {
    log.info("No raw lua scripts for copy found");
  }
}

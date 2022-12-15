import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";

import { default as chalk } from "chalk";

import { GAME_DATA_CONFIGS_DIR, TARGET_GAME_DATA_CONFIGS_DIR } from "#/build/build_globals";
import { Logger, readDirContent } from "#/utils";

const log: Logger = new Logger("BUILD_CONFIGS_STATICS");
const EXPECTED_CONFIG_EXTENSIONS: Array<string> = [ ".ltx", ".xml" ];

export async function buildConfigsStatics(): Promise<void> {
  log.info("Copy static configs");

  function collectConfigs(acc: Array<[string, string]>, it: Array<string> | string): Array<[string, string]> {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectConfigs(acc, nested));
    } else if (EXPECTED_CONFIG_EXTENSIONS.includes(path.extname(it))) {
      const relativePath: string = it.slice(GAME_DATA_CONFIGS_DIR.length);

      acc.push([ it, path.join(TARGET_GAME_DATA_CONFIGS_DIR, relativePath) ]);
    }

    return acc;
  }

  const staticConfigs: Array<[string, string]> = (await readDirContent(GAME_DATA_CONFIGS_DIR)).reduce(
    collectConfigs,
    []
  );

  if (staticConfigs.length > 0) {
    log.info("Found static configs:");

    /**
     * Sync way for folder creation when needed.
     */
    staticConfigs.forEach(([ from, to ]) => {
      const targetDir: string = path.dirname(to);

      if (!fs.existsSync(targetDir)) {
        log.info("MKDIR:", chalk.yellowBright(targetDir));
        fs.mkdirSync(targetDir, { recursive: true });
      }
    });

    await Promise.all(
      staticConfigs.map(([ from, to ]) => {
        log.info("CP:", chalk.yellow(to));

        return fsPromises.copyFile(from, to);
      })
    );

    log.info("Configs processed:", staticConfigs.length);
  } else {
    log.info("No static configs found");
  }
}

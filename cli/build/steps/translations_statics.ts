import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";

import { default as chalk } from "chalk";

import { TFolderFiles, TFolderReplicationDescriptor } from "@/mod/lib/types/general";

import { GAME_DATA_TRANSLATIONS_DIR, TARGET_GAME_DATA_TRANSLATIONS_DIR } from "#/build/globals";
import { NodeLogger, readDirContent } from "#/utils";

const log: NodeLogger = new NodeLogger("BUILD_TRANSLATIONS_STATIC");
const EXPECTED_CONFIG_EXTENSIONS: Array<string> = [".xml"];

export async function buildStaticTranslations(): Promise<void> {
  log.info(chalk.blueBright("Copy static translations"));

  function collectTranslations(
    acc: Array<TFolderReplicationDescriptor>,
    it: TFolderFiles
  ): Array<TFolderReplicationDescriptor> {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectTranslations(acc, nested));
    } else if (EXPECTED_CONFIG_EXTENSIONS.includes(path.extname(it))) {
      const relativePath: string = it.slice(GAME_DATA_TRANSLATIONS_DIR.length);

      acc.push([it, path.join(TARGET_GAME_DATA_TRANSLATIONS_DIR, relativePath)]);
    }

    return acc;
  }

  const staticTranslations: Array<TFolderReplicationDescriptor> = (
    await readDirContent(GAME_DATA_TRANSLATIONS_DIR)
  ).reduce(collectTranslations, []);

  if (staticTranslations.length > 0) {
    log.info("Found static translations:");

    /**
     * Sync way for folder creation when needed.
     */
    staticTranslations.forEach(([from, to]) => {
      const targetDir: string = path.dirname(to);

      if (!fs.existsSync(targetDir)) {
        log.debug("MKDIR:", chalk.yellowBright(targetDir));
        fs.mkdirSync(targetDir, { recursive: true });
      }
    });

    await Promise.all(
      staticTranslations.map(([from, to]) => {
        log.debug("CP:", chalk.yellow(to));

        return fsPromises.copyFile(from, to);
      })
    );

    log.info("Translation files processed:", staticTranslations.length);
  } else {
    log.info("No static translations found");
  }
}

import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";

import { default as chalk } from "chalk";

import { GAME_DATA_UI_DIR, TARGET_GAME_DATA_UI_DIR } from "#/build/globals";
import { Logger, readDirContent } from "#/utils";
import { renderJsxToXmlText } from "#/utils/xml";

const log: Logger = new Logger("BUILD_UI_STATIC");
const EXPECTED_STATIC_XML_EXTENSIONS: Array<string> = [ ".xml" ];

export async function buildStaticUi(): Promise<void> {
  log.info("Copy static UI schemas");

  function collectXmlConfigs(acc: Array<[string, string]>, it: Array<string> | string): Array<[string, string]> {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectXmlConfigs(acc, nested));
    } else if (EXPECTED_STATIC_XML_EXTENSIONS.includes(path.extname(it))) {
      const to: string = it.slice(GAME_DATA_UI_DIR.length);

      acc.push([ it, path.join(TARGET_GAME_DATA_UI_DIR, to) ]);
    }

    return acc;
  }

  const xmlConfigs: Array<[string, string]> = (await readDirContent(GAME_DATA_UI_DIR)).reduce(
    collectXmlConfigs,
    []
  );

  if (xmlConfigs.length > 0) {
    log.info("Found static UI configs");

    /**
     * Sync way for folder creation when needed.
     */
    xmlConfigs.forEach(([ from, to ]) => {
      const targetDir: string = path.dirname(to);

      if (!fs.existsSync(targetDir)) {
        log.info("MKDIR:", chalk.yellowBright(targetDir));
        fs.mkdirSync(targetDir, { recursive: true });
      }
    });

    await Promise.all(
      xmlConfigs.map(([ from, to ]) => {
        log.info("CP:", chalk.yellow(to));

        return fsPromises.copyFile(from, to);
      })
    );

    log.info("XML files copied:", xmlConfigs.length);
  } else {
    log.info("No static XML configs found");
  }
}

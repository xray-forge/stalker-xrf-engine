import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";

import { default as chalk } from "chalk";

import { TFolderFiles, TFolderReplicationDescriptor } from "@/mod/lib/types/general";

import { GAME_DATA_UI_DIR, TARGET_GAME_DATA_UI_DIR } from "#/build/globals";
import { Logger, readDirContent } from "#/utils";
import { renderJsxToXmlText } from "#/utils/xml";

const log: Logger = new Logger("BUILD_UI_DYNAMIC");
const EXPECTED_DYNAMIC_XML_EXTENSIONS: Array<string> = [ ".tsx", ".ts" ];

export async function buildDynamicUi(): Promise<void> {
  log.info("Build dynamic UI schemas");

  function collectXmlConfigs(
    acc: Array<TFolderReplicationDescriptor>,
    it: TFolderFiles
  ): Array<TFolderReplicationDescriptor> {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectXmlConfigs(acc, nested));
    } else if (EXPECTED_DYNAMIC_XML_EXTENSIONS.includes(path.extname(it))) {
      const to: string = it.slice(GAME_DATA_UI_DIR.length).replace(/\.[^/.]+$/, "") + ".xml";

      acc.push([ it, path.join(TARGET_GAME_DATA_UI_DIR, to) ]);
    }

    return acc;
  }

  const xmlConfigs: Array<TFolderReplicationDescriptor> = (await readDirContent(GAME_DATA_UI_DIR)).reduce(
    collectXmlConfigs,
    []
  );

  if (xmlConfigs.length > 0) {
    log.info("Found dynamic XML configs");

    /**
     * Sync way for folder creation when needed.
     */
    xmlConfigs.forEach(([ from, to ]) => {
      const targetDir: string = path.dirname(to);

      if (!fs.existsSync(targetDir)) {
        log.info("MKDIR:", chalk.blueBright(targetDir));
        fs.mkdirSync(targetDir, { recursive: true });
      }
    });

    let processedXmlConfigs: number = 0;

    await Promise.all(
      xmlConfigs.map(async ([ from, to ]) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const xmlSource = require(from);
        const xmlContent = typeof xmlSource?.create === "function" && xmlSource?.IS_XML && xmlSource?.create();

        if (xmlContent) {
          log.info("TRANSFORM:", chalk.blue(to));

          await fsPromises.writeFile(to, renderJsxToXmlText(xmlContent));

          processedXmlConfigs += 1;
        } else {
          log.warn("SKIP, not XML source:", chalk.blue(from));
        }
      })
    );

    log.info("XML files processed:", processedXmlConfigs);
  } else {
    log.info("No dynamic XML configs found");
  }
}

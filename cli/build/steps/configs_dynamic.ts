import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";

import { default as chalk } from "chalk";

import { GAME_DATA_CONFIGS_DIR, TARGET_GAME_DATA_CONFIGS_DIR } from "#/build/globals";
import { Logger, readDirContent } from "#/utils";
import { renderJsxToXmlText } from "#/utils/xml";

const log: Logger = new Logger("BUILD_CONFIGS_STATICS");
const EXPECTED_DYNAMIC_XML_EXTENSIONS: Array<string> = [ ".tsx" ];

export async function buildDynamicConfigs(): Promise<void> {
  log.info("Build dynamic configs");

  await transformXmlConfigs();
}

async function transformXmlConfigs(): Promise<void> {
  log.info("Transforming XML configs");

  function collectXmlConfigs(acc: Array<[string, string]>, it: Array<string> | string): Array<[string, string]> {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectXmlConfigs(acc, nested));
    } else if (EXPECTED_DYNAMIC_XML_EXTENSIONS.includes(path.extname(it))) {
      const to: string = it.slice(GAME_DATA_CONFIGS_DIR.length).replace(/\.[^/.]+$/, "") + ".xml";

      acc.push([ it, path.join(TARGET_GAME_DATA_CONFIGS_DIR, to) ]);
    }

    return acc;
  }

  const xmlConfigs: Array<[string, string]> = (await readDirContent(GAME_DATA_CONFIGS_DIR)).reduce(
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
        log.info("MKDIR:", chalk.yellowBright(targetDir));
        fs.mkdirSync(targetDir, { recursive: true });
      }
    });

    await Promise.all(
      xmlConfigs.map(async ([ from, to ]) => {
        log.info("FOUND:", chalk.yellow(to));

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const xmlSource = require(from);
        const xmlContent = typeof xmlSource?.create === "function" && xmlSource?.create();

        if (xmlContent) {
          log.info("TRANSFORM:", chalk.yellow(to));

          await fsPromises.writeFile(to, renderJsxToXmlText(xmlContent));
        } else {
          log.warn("SKIP, invalid source:", chalk.yellow(from));
        }
      })
    );

    log.info("XML files processed:", xmlConfigs.length);
  } else {
    log.info("No dynamic XML configs found");
  }
}

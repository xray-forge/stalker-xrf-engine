import fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";
import * as process from "process";

import { default as chalk } from "chalk";

import { ROOT_DIR, TARGET_PARSED } from "#/globals";
import { NodeLogger, readDirContentFlat } from "#/utils";

import { Maybe } from "@/engine/lib/types";

const TARGET_PATH: Maybe<string> = process.argv[2];
const NO_EXT: boolean = process.argv.includes("--no-ext");

const log: NodeLogger = new NodeLogger("PARSE_DIR_AS_JSON");

(async function buildMod(): Promise<void> {
  if (TARGET_PATH) {
    const parseTargetPath: string = path.resolve(ROOT_DIR, TARGET_PATH);
    const targetFilePath: string = path.resolve(TARGET_PARSED, `${path.parse(parseTargetPath).base}.json`);

    log.info("Parsing game dir as json:", chalk.yellowBright(parseTargetPath));

    const tree: Array<string> = (await readDirContentFlat(parseTargetPath))
      .map((it) => {
        return it.slice(parseTargetPath.length + 1);
      })
      .sort();

    log.info("Writing parsed tree to:", chalk.yellowBright(targetFilePath));

    if (!fs.existsSync(TARGET_PARSED)) {
      log.debug("MKDIR:", chalk.yellowBright(TARGET_PARSED));
      fs.mkdirSync(TARGET_PARSED, { recursive: true });
    }

    const resultingObject: Record<string, string> = tree.reduce((acc, it) => {
      const withoutExt: string = it.substring(0, it.lastIndexOf("."));
      const normalizedToKey: string = withoutExt.replaceAll("\\", "_");

      acc[normalizedToKey] = NO_EXT ? withoutExt : it;

      return acc;
    }, {});

    await fsPromises.writeFile(targetFilePath, JSON.stringify(resultingObject, null, 2));

    log.info(`Result: ${chalk.green("OK")}, entries parsed:`, tree.length, "\n`");
  } else {
    log.error("Path param is not provided, string expected but got:", chalk.yellowBright(TARGET_PATH));

    throw new Error("Invalid argument supplied.");
  }
})();

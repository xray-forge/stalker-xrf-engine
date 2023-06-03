import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";

import { default as chalk } from "chalk";

import { ROOT_DIR, TARGET_PARSED_DIR } from "#/globals/paths";
import { NodeLogger, readDirContentFlat } from "#/utils";

const log: NodeLogger = new NodeLogger("PARSE_DIR_AS_JSON");

interface IParseDirParameters {
  extension: boolean;
}

/**
 * Parse provided dir tree to JSON file.
 */
export async function parseDirAsJson(targetPath: string, parameters: IParseDirParameters): Promise<void> {
  if (targetPath) {
    const parseTargetPath: string = path.resolve(ROOT_DIR, targetPath);
    const targetFilePath: string = path.resolve(TARGET_PARSED_DIR, `${path.parse(parseTargetPath).base}.json`);

    log.info("Parsing game dir as json:", chalk.yellowBright(parseTargetPath));

    const tree: Array<string> = (await readDirContentFlat(parseTargetPath))
      .map((it) => {
        return it.slice(parseTargetPath.length + 1);
      })
      .sort();

    log.info("Writing parsed tree to:", chalk.yellowBright(targetFilePath));

    if (!fs.existsSync(TARGET_PARSED_DIR)) {
      log.debug("MKDIR:", chalk.yellowBright(TARGET_PARSED_DIR));
      fs.mkdirSync(TARGET_PARSED_DIR, { recursive: true });
    }

    const resultingObject: Record<string, string> = tree.reduce((acc, it) => {
      const withoutExt: string = it.substring(0, it.lastIndexOf("."));
      const normalizedToKey: string = withoutExt.replaceAll("\\", "_");

      acc[normalizedToKey] = parameters.extension ? it : withoutExt;

      return acc;
    }, {});

    await fsPromises.writeFile(targetFilePath, JSON.stringify(resultingObject, null, 2));

    log.info(`Result: ${chalk.green("OK")}, entries parsed:`, tree.length, "\n`");
  } else {
    log.error("Path param is not provided, string expected but got:", chalk.yellowBright(targetPath));

    throw new Error("Invalid argument supplied.");
  }
}

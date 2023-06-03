import * as path from "path";

import { default as chalk } from "chalk";

import { GAME_DATA_SCRIPTS_DIR } from "#/globals";
import { getExternDocs } from "#/parse/utils/get_extern_docs";
import { IExternFileDescriptor } from "#/parse/utils/types";
import { NodeLogger, readDirContent, TFolderFiles } from "#/utils";

const log: NodeLogger = new NodeLogger("PARSE_DIR_AS_JSON");

/**
 * Parse game engine externals and generate docs.
 */
export async function parseExternals(): Promise<void> {
  const targetDir: string = path.resolve(GAME_DATA_SCRIPTS_DIR, "declarations");

  log.info("Parsing game externals:", chalk.yellowBright(targetDir));

  const filesToParse: Array<string> = await getSourcesList(targetDir);
  const docs: Array<IExternFileDescriptor> = getExternDocs(filesToParse);

  log.info("Parsed externals for files:", filesToParse.length);

  // todo: Save in a file
  // todo: Handle type alias in resulting files
}

/**
 * Get list of LTX transformable descriptors.
 */
async function getSourcesList(source: string): Promise<Array<string>> {
  function collectList(acc: Array<string>, it: TFolderFiles): Array<string> {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectList(acc, nested));
    } else if (path.extname(it) === ".ts" && !it.endsWith(".test.ts") && !it.endsWith("index.ts")) {
      acc.push(it);
    }

    return acc;
  }

  return (await readDirContent(source)).reduce<Array<string>>(collectList, [] as Array<string>);
}

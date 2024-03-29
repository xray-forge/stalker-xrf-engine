import * as fsp from "fs/promises";
import * as path from "path";

import { yellowBright } from "chalk";

import { GAME_DATA_SCRIPTS_DIR, TARGET_PARSED_DIR } from "#/globals";
import { getExternDocs } from "#/parse/utils/get_extern_docs";
import { renderExternals } from "#/parse/utils/render_externals";
import { IExternFileDescriptor, IExternFunction } from "#/parse/utils/types";
import { createDirIfNoExisting } from "#/utils/fs/create_dir_if_no_existing";
import { getPathParentFolder } from "#/utils/fs/get_path_parent_folder";
import { readDirContent } from "#/utils/fs/read_dir_content";
import { NodeLogger } from "#/utils/logging";
import { TFolderFiles } from "#/utils/types";
import { renderJsxToXmlText } from "#/utils/xml";

const log: NodeLogger = new NodeLogger("PARSE_DIR_AS_JSON");

/**
 * Parse game engine externals and generate docs.
 */
export async function parseExternals(): Promise<void> {
  const targetDir: string = path.resolve(GAME_DATA_SCRIPTS_DIR, "declarations");
  const targetFilePath: string = path.resolve(TARGET_PARSED_DIR, "externals.html");

  log.info("Parsing game externals:", yellowBright(targetDir));

  const filesToParse: Array<string> = await getSourcesList(targetDir);
  const docs: Array<IExternFileDescriptor> = getExternDocs(filesToParse);

  log.info("Parsed externals for files:", filesToParse.length);
  log.warn("Writing resulting file:", yellowBright(targetFilePath));

  const content: string = renderJsxToXmlText(
    renderExternals(
      docs.reduce((acc, it: IExternFileDescriptor) => {
        const moduleName: string = getPathParentFolder(it.file);

        acc[moduleName] = [...(acc[moduleName] ?? []), ...it.extern] as Array<IExternFunction>;

        return acc;
      }, {})
    )
  );

  createDirIfNoExisting(TARGET_PARSED_DIR);

  await fsp.writeFile(targetFilePath, content);
}

/**
 * @returns descriptors of files to parse and generate docs
 */
async function getSourcesList(source: string): Promise<Array<string>> {
  /**
   * Recursively find all files with possible definitions for docs generation.
   */
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

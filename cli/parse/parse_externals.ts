import * as fsp from "node:fs/promises";
import * as path from "node:path";

import { yellowBright } from "chalk";

import { GAME_DATA_DECLARATIONS_DIR, TARGET_PARSED_DIR } from "#/globals";
import { getExternDocs } from "#/parse/utils/get_extern_docs";
import { getExternModuleName } from "#/parse/utils/get_extern_module_name";
import { getExternSourceFiles } from "#/parse/utils/get_extern_sources";
import { renderExternals } from "#/parse/utils/render_externals";
import { IExternFileDescriptor, IExternFunction } from "#/parse/utils/types";
import { createDirIfNoExisting } from "#/utils/fs/create_dir_if_no_existing";
import { NodeLogger } from "#/utils/logging";
import { renderJsxToXmlText } from "#/utils/xml";

const log: NodeLogger = NodeLogger.forFile(__filename);

/**
 * Parse game engine externals and generate docs.
 */
export async function parseExternals(): Promise<void> {
  const targetDir: string = GAME_DATA_DECLARATIONS_DIR;
  const targetFilePath: string = path.resolve(TARGET_PARSED_DIR, "externals.html");

  log.info("Parsing game externals:", yellowBright(targetDir));

  const filesToParse: Array<string> = await getExternSourceFiles(targetDir);
  const docs: Array<IExternFileDescriptor> = getExternDocs(filesToParse);

  log.info("Parsed externals for files:", filesToParse.length);
  log.warn("Writing resulting file:", yellowBright(targetFilePath));

  const content: string = renderJsxToXmlText(
    renderExternals(
      docs.reduce((acc: Record<string, Array<IExternFunction>>, it: IExternFileDescriptor) => {
        const fallbackModuleName: string = path.relative(targetDir, it.file).split(path.sep)[0];

        it.extern.forEach((external: IExternFunction) => {
          const moduleName: string = getExternModuleName(external.name, fallbackModuleName);

          acc[moduleName] = [...(acc[moduleName] ?? []), external];
        });

        return acc;
      }, {})
    )
  );

  createDirIfNoExisting(TARGET_PARSED_DIR);

  await fsp.writeFile(targetFilePath, content);
}

import * as fsp from "fs/promises";
import * as path from "path";

import { yellowBright } from "chalk";

import { GAME_DATA_LTX_CONFIGS_DIR } from "#/globals";
import { readDirContent } from "#/utils/fs";
import { NodeLogger } from "#/utils/logging";
import { EAssetExtension, TFolderFiles } from "#/utils/types";

const log: NodeLogger = new NodeLogger("FORMAT_LTX");

export interface IFormatLtxParameters {
  filter?: Array<string>;
}

/**
 * Start game executable provided in config.json file.
 */
export async function formatLtx(parameters: IFormatLtxParameters): Promise<void> {
  log.info("Formatting ltx files");

  const files: Array<string> = await getLtxConfigs(parameters.filter);

  for (const file of files) {
    await formatLtxFile(file);
  }
}

/**
 * Format specific file by path.
 */
async function formatLtxFile(file: string): Promise<void> {
  log.info("Format:", yellowBright(file));

  const buffer: Buffer = await fsp.readFile(file);
  const formatted: string = buffer
    .toString()
    .trim()
    // eslint-disable-next-line no-control-regex
    .replace(/([\x09 ])+/g, " ") // Replace all duplicated whitespaces with single spaces.
    .replace(/((\r\n( )+)|(( )+\r\n))/g, "\r\n") // Replace spaces on end of line / start of line.
    .replace(/(\r\n){2,}/g, "\r\n\r\n") // Replace duplicated new lines with single \n.
    .replace(/(?<!(\r\n)|(^)) *; */g, " ; ") // Replace semicolons with space-wrapped.
    .replace(/(\r\n); */g, "\r\n; "); // Replace semicolons at start of string with space-wrapped.

  const isEndingWithNewLine: boolean = formatted.endsWith("\r\n");

  await fsp.writeFile(file, isEndingWithNewLine ? formatted : formatted + "\r\n");
}

/**
 * Get list of static configs.
 */
async function getLtxConfigs(filters: Array<string> = []): Promise<Array<string>> {
  /**
   * Collect list of files for LTX formatting in provided directory.
   */
  function collectConfigs(acc: Array<string>, it: TFolderFiles): Array<string> {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectConfigs(acc, nested));
    } else if (path.extname(it) === EAssetExtension.LTX) {
      // Filter.
      if (!filters.length || filters.some((filter) => it.match(filter))) {
        acc.push(it);
      }
    }

    return acc;
  }

  return (await readDirContent(GAME_DATA_LTX_CONFIGS_DIR)).reduce<Array<string>>(collectConfigs, []);
}

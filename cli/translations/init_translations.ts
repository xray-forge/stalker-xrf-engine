import * as fsp from "fs/promises";
import * as path from "path";

import { red, yellow } from "chalk";

import { default as config } from "#/config.json";
import { exists } from "#/utils/fs/exists";
import { isDirectory } from "#/utils/fs/is_directory";
import { readDirContentFlat } from "#/utils/fs/read_dir_content_flat";
import { NodeLogger } from "#/utils/logging";
import { AnyObject, EAssetExtension, IJsonTranslationSchema } from "#/utils/types";

const log: NodeLogger = new NodeLogger("INIT_TRANSLATIONS");

interface IInitTranslationParameters {
  verbose?: boolean;
}

/**
 * Init provided file path as JSON translation dictionary.
 */
export async function initTranslations(target: string, parameters: IInitTranslationParameters): Promise<void> {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  log.info("Initialize translation:", yellow(target));
  log.debug("Running with parameters:", parameters);

  // Throw, no path exists.
  if (!(await exists(target))) {
    log.error("Cannot find path for initialization:", red(target));

    throw new Error("Provided path does not exist.");
  }

  const isSourceDirectory: boolean = await isDirectory(target);

  const files: Array<string> = isSourceDirectory
    ? (await readDirContentFlat(target)).filter((it) => path.extname(it) === EAssetExtension.JSON)
    : [target];

  try {
    for (const it of files) {
      const data: IJsonTranslationSchema = JSON.parse((await fsp.readFile(it)).toString());

      await fsp.writeFile(it, JSON.stringify(initializeTranslationJSON(data), null, 2) + "\n");

      log.info("Updating resulting file:", yellow(it));
    }
  } catch (error) {
    log.error("Initialization of translations failed:", error.message);
    throw error;
  }
}

/**
 * Initialize all locale fields for the object.
 */
function initializeTranslationJSON(data: AnyObject): IJsonTranslationSchema {
  Object.entries(data).forEach(([key, value]) => {
    data[key] = config.available_locales.reduce((translation, lang) => {
      translation[lang] = value[lang] ?? null;

      return translation;
    }, {});
  });

  return data;
}

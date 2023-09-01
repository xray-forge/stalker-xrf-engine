import * as fsp from "fs/promises";
import * as path from "path";

import { red, yellow } from "chalk";

import { GAME_DATA_TRANSLATIONS_DIR } from "#/globals";
import { AnyObject, EAssetExtension, exists, NodeLogger, readDirContentFlat } from "#/utils";

const log: NodeLogger = new NodeLogger("CHECK_TRANSLATIONS");

interface IListProblematicTranslationParameters {
  verbose?: boolean;
  language?: string;
}

/**
 * Parse provided file path as JSON.
 */
export async function checkTranslations(parameters: IListProblematicTranslationParameters): Promise<void> {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  log.info("List problematic translations:", yellow(GAME_DATA_TRANSLATIONS_DIR), parameters.language || "all");
  log.debug("Running with parameters:", parameters);

  // Throw, no path exists.
  if (!(await exists(GAME_DATA_TRANSLATIONS_DIR))) {
    log.error("Cannot find path for checking:", red(GAME_DATA_TRANSLATIONS_DIR));

    throw new Error("Translations path does not exist.");
  }

  const files: Array<string> = (await readDirContentFlat(GAME_DATA_TRANSLATIONS_DIR)).filter(
    (it) => path.extname(it) === EAssetExtension.JSON
  );

  try {
    let issuesCount: number = 0;

    for (const it of files) {
      issuesCount += await analyzeTranslationJSON(it, parameters);
    }

    if (issuesCount) {
      log.info("Detected issues:", issuesCount);
    } else {
      log.info("No issues detected");
    }
  } catch (error) {
    log.error("Initialization of translations failed:", error.message);
    throw error;
  }
}

/**
 * Initialize all locale fields for the object.
 */
async function analyzeTranslationJSON(
  file: string,
  parameters: IListProblematicTranslationParameters
): Promise<number> {
  const data: AnyObject = JSON.parse((await fsp.readFile(file)).toString());
  let count: number = 0;

  Object.entries(data).forEach(([key, value]) => {
    if (parameters.language) {
      if (!value[parameters.language]) {
        log.info("Missing translation:", yellow(file), yellow(parameters.language), "->", yellow(key));
        count += 1;
      }
    } else {
      Object.entries(value).forEach(([currentLocale, currentTranslation]) => {
        if (currentTranslation === null) {
          log.info("Missing translation:", yellow(file), yellow(currentLocale), "->", yellow(key));
          count += 1;
        }
      });
    }
  });

  return count;
}

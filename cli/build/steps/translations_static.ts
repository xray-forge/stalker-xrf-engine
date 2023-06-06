import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";

import { blueBright, yellow, yellowBright } from "chalk";

import { default as config } from "#/config.json";
import { GAME_DATA_TRANSLATIONS_DIR, TARGET_GAME_DATA_TRANSLATIONS_DIR } from "#/globals";
import { NodeLogger, readDirContent, TFolderFiles, TFolderReplicationDescriptor } from "#/utils";

const log: NodeLogger = new NodeLogger("BUILD_TRANSLATIONS_DYNAMIC");

/**
 * Build static translation files.
 */
export async function buildStaticTranslations(): Promise<void> {
  log.info(blueBright("Build static translations"));

  const translations: Array<TFolderReplicationDescriptor> = (await readDirContent(GAME_DATA_TRANSLATIONS_DIR)).reduce(
    collectTranslations,
    []
  );

  if (translations.length > 0) {
    log.info("Found static translations:", translations.length);

    /**
     * Sync way for folder creation when needed.
     */
    translations.forEach(([from, to]) => {
      const targetDir: string = path.dirname(to);

      if (!fs.existsSync(targetDir)) {
        log.debug("MKDIR:", yellowBright(targetDir));
        fs.mkdirSync(targetDir, { recursive: true });
      }
    });

    await Promise.all(
      translations.map(([from, to]) => {
        log.debug("CP:", yellow(to));

        return fsPromises.copyFile(from, to);
      })
    );

    log.info("Translations processed:", translations.length);
  } else {
    log.info("No static translations found");
  }
}

/**
 * Collect static translations files list.
 */
function collectTranslations(
  acc: Array<TFolderReplicationDescriptor>,
  it: TFolderFiles
): Array<TFolderReplicationDescriptor> {
  if (Array.isArray(it)) {
    it.forEach((nested) => collectTranslations(acc, nested));
  } else if (path.extname(it) === ".xml") {
    const relativePath: string = it.slice(GAME_DATA_TRANSLATIONS_DIR.length);
    const isLocaleBased: boolean = isLocaleBasedXml(relativePath);

    // Based on file ending copy it for all locales or only for the desired one.
    if (isLocaleBased) {
      acc.push([it, path.join(TARGET_GAME_DATA_TRANSLATIONS_DIR, getLocaleFromXmlName(relativePath), relativePath)]);
    } else {
      config.available_locales.forEach((locale) => {
        acc.push([it, path.join(TARGET_GAME_DATA_TRANSLATIONS_DIR, locale, relativePath)]);
      });
    }
  }

  return acc;
}

/**
 * Check whether provided XML path is locale based.
 */
function isLocaleBasedXml(name: string): boolean {
  return config.available_locales.some((it) => name.endsWith(`.${it}.xml`));
}

/**
 * Get locale based on file extension.
 */
function getLocaleFromXmlName(name: string): string {
  const parts: Array<string> = name.split(".");

  return parts[parts.length - 2];
}

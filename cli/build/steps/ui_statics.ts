import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";

import { blueBright, yellow, yellowBright } from "chalk";

import { IBuildCommandParameters } from "#/build/build";
import { GAME_DATA_UI_DIR, TARGET_GAME_DATA_UI_DIR } from "#/globals/paths";
import { EAssetExtension, NodeLogger, readDirContent, TFolderReplicationDescriptor } from "#/utils";

const log: NodeLogger = new NodeLogger("BUILD_UI_STATIC");

/**
 * Copy static XML files of UI.
 */
export async function buildStaticUi(parameters: IBuildCommandParameters): Promise<void> {
  log.info(blueBright("Copy static UI schemas"));

  const xmlConfigs: Array<TFolderReplicationDescriptor> = await getUiConfigs(parameters.filter);

  if (xmlConfigs.length > 0) {
    log.info("Found static UI configs");

    /**
     * Sync way for folder creation when needed.
     */
    xmlConfigs.forEach(([from, to]) => {
      const targetDir: string = path.dirname(to);

      if (!fs.existsSync(targetDir)) {
        log.debug("MKDIR:", yellowBright(targetDir));
        fs.mkdirSync(targetDir, { recursive: true });
      }
    });

    await Promise.all(
      xmlConfigs.map(([from, to]) => {
        log.debug("CP:", yellow(to));

        return fsPromises.copyFile(from, to);
      })
    );

    log.info("XML files copied:", xmlConfigs.length);
  } else {
    log.info("No static XML configs found");
  }
}

/**
 * Get UI configuration files list.
 */
async function getUiConfigs(filters: Array<string> = []): Promise<Array<TFolderReplicationDescriptor>> {
  /**
   * todo;
   */
  function collectXmlConfigs(
    acc: Array<TFolderReplicationDescriptor>,
    it: Array<string> | string
  ): Array<TFolderReplicationDescriptor> {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectXmlConfigs(acc, nested));
    } else if (path.extname(it) === EAssetExtension.XML) {
      const to: string = it.slice(GAME_DATA_UI_DIR.length);

      // Filter.
      if (!filters.length || filters.some((filter) => it.match(filter))) {
        acc.push([it, path.join(TARGET_GAME_DATA_UI_DIR, to)]);
      }
    }

    return acc;
  }

  return (await readDirContent(GAME_DATA_UI_DIR)).reduce(collectXmlConfigs, []);
}

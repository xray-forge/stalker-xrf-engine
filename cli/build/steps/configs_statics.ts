import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";

import { blueBright, yellow, yellowBright } from "chalk";

import { IBuildCommandParameters } from "#/build/build";
import { GAME_DATA_LTX_CONFIGS_DIR, TARGET_GAME_DATA_CONFIGS_DIR } from "#/globals/paths";
import { EAssetExtension, NodeLogger, readDirContent, TFolderFiles, TFolderReplicationDescriptor } from "#/utils";

const log: NodeLogger = new NodeLogger("BUILD_CONFIGS_STATICS");

const EXPECTED_CONFIG_EXTENSIONS: Array<EAssetExtension> = [EAssetExtension.LTX, EAssetExtension.XML];

/**
 * Simply copy .xml and .ltx config statics to resulting gamedata directory.
 */
export async function buildStaticConfigs(parameters: IBuildCommandParameters): Promise<void> {
  log.info(blueBright("Copy static configs"));

  const staticConfigs: Array<TFolderReplicationDescriptor> = await getStaticConfigs(parameters.filter);

  if (staticConfigs.length > 0) {
    log.info("Found static configs:", staticConfigs.length);

    /**
     * Sync way for folder creation when needed.
     */
    staticConfigs.forEach(([from, to]) => {
      const targetDir: string = path.dirname(to);

      if (!fs.existsSync(targetDir)) {
        log.debug("MKDIR:", yellowBright(targetDir));
        fs.mkdirSync(targetDir, { recursive: true });
      }
    });

    await Promise.all(
      staticConfigs.map(([from, to]) => {
        log.debug("CP:", yellow(to));

        return fsPromises.copyFile(from, to);
      })
    );

    log.info("Configs processed:", staticConfigs.length);
  } else {
    log.info("No static configs found", parameters.filter);
  }
}

/**
 * Get list of static configs.
 */
async function getStaticConfigs(filters: Array<string> = []): Promise<Array<TFolderReplicationDescriptor>> {
  /**
   * Collect list of LTX configs for including in build.
   * Recursively find all ltx files in configs dir.
   */
  function collectConfigs(
    acc: Array<TFolderReplicationDescriptor>,
    it: TFolderFiles
  ): Array<TFolderReplicationDescriptor> {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectConfigs(acc, nested));
    } else if (EXPECTED_CONFIG_EXTENSIONS.includes(path.extname(it) as EAssetExtension)) {
      const relativePath: string = it.slice(GAME_DATA_LTX_CONFIGS_DIR.length);

      // Filter.
      if (!filters.length || filters.some((filter) => it.match(filter))) {
        acc.push([it, path.join(TARGET_GAME_DATA_CONFIGS_DIR, relativePath)]);
      }
    }

    return acc;
  }

  return (await readDirContent(GAME_DATA_LTX_CONFIGS_DIR)).reduce(collectConfigs, []);
}

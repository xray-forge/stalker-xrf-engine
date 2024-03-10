import * as fsp from "fs/promises";

import { blueBright, yellow } from "chalk";

import { IBuildCommandParameters } from "#/build/build";
import { getFolderReplicationDescriptors } from "#/build/utils";
import { GAME_DATA_LTX_CONFIGS_DIR, TARGET_GAME_DATA_CONFIGS_DIR } from "#/globals/paths";
import { createDirForConfigs } from "#/utils/fs/create_dir_for_configs";
import { NodeLogger } from "#/utils/logging";
import { EAssetExtension, TFolderReplicationDescriptor } from "#/utils/types";

const log: NodeLogger = new NodeLogger("BUILD_CONFIGS_STATICS");

/**
 * Simply copy .xml and .ltx config statics to resulting gamedata directory.
 */
export async function buildStaticConfigs(parameters: IBuildCommandParameters): Promise<void> {
  log.info(blueBright("Copy static configs"));

  const ltxDescriptors: Array<TFolderReplicationDescriptor> = await getFolderReplicationDescriptors({
    fromDirectory: GAME_DATA_LTX_CONFIGS_DIR,
    toDirectory: TARGET_GAME_DATA_CONFIGS_DIR,
    fromExtension: EAssetExtension.LTX,
    toExtension: EAssetExtension.LTX,
    filters: parameters.filter,
  });
  const xmlDescriptors: Array<TFolderReplicationDescriptor> = await getFolderReplicationDescriptors({
    fromDirectory: GAME_DATA_LTX_CONFIGS_DIR,
    toDirectory: TARGET_GAME_DATA_CONFIGS_DIR,
    fromExtension: EAssetExtension.XML,
    toExtension: EAssetExtension.XML,
    filters: parameters.filter,
  });
  const descriptors: Array<TFolderReplicationDescriptor> = ltxDescriptors.concat(xmlDescriptors);

  if (descriptors.length) {
    log.info("Found static configs:", descriptors.length);

    createDirForConfigs(descriptors, log);

    await Promise.all(
      descriptors.map(([from, to]) => {
        log.debug("CP:", yellow(to));

        return fsp.copyFile(from, to);
      })
    );

    log.info("Configs processed:", descriptors.length);
  } else {
    log.info("No static configs found", parameters.filter);
  }
}

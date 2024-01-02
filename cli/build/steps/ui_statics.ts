import * as fsp from "fs/promises";

import { blueBright, yellow } from "chalk";

import { IBuildCommandParameters } from "#/build/build";
import { getFolderReplicationDescriptors } from "#/build/utils";
import { GAME_DATA_UI_DIR, TARGET_GAME_DATA_UI_DIR } from "#/globals/paths";
import { createDirForConfigs } from "#/utils/fs";
import { NodeLogger } from "#/utils/logging";
import { EAssetExtension, TFolderReplicationDescriptor } from "#/utils/types";

const log: NodeLogger = new NodeLogger("BUILD_UI_STATIC");

/**
 * Copy static XML files of UI.
 *
 * @param parameters - build command run parameters
 */
export async function buildStaticUi(parameters: IBuildCommandParameters): Promise<void> {
  log.info(blueBright("Copy static UI schemas"));

  const descriptors: Array<TFolderReplicationDescriptor> = await getFolderReplicationDescriptors({
    fromDirectory: GAME_DATA_UI_DIR,
    toDirectory: TARGET_GAME_DATA_UI_DIR,
    fromExtension: EAssetExtension.XML,
    toExtension: EAssetExtension.XML,
    filters: parameters.filter,
  });

  if (descriptors.length) {
    log.info("Found static UI configs:", descriptors.length);

    createDirForConfigs(descriptors);

    await Promise.all(
      descriptors.map(([from, to]) => {
        log.debug("CP:", yellow(to));

        return fsp.copyFile(from, to);
      })
    );

    log.info("UI XML files copied:", descriptors.length);
  } else {
    log.info("No static UI XML configs found");
  }
}

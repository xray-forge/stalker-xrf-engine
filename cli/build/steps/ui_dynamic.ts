import * as fsp from "fs/promises";

import { blue, blueBright } from "chalk";

import { IBuildCommandParameters } from "#/build/build";
import { getFolderReplicationDescriptors } from "#/build/utils";
import { GAME_DATA_UI_DIR, TARGET_GAME_DATA_UI_DIR } from "#/globals/paths";
import { createDirForConfigs } from "#/utils/fs/create_dir_for_configs";
import { NodeLogger } from "#/utils/logging";
import { EAssetExtension, TFolderReplicationDescriptor } from "#/utils/types";
import { renderJsxToXmlText } from "#/utils/xml";

const log: NodeLogger = new NodeLogger("BUILD_UI_DYNAMIC");

const EXPECTED_DYNAMIC_XML_EXTENSIONS: Array<EAssetExtension> = [EAssetExtension.TS, EAssetExtension.TSX];

/**
 * Build XML game forms from JSX forms.
 */
export async function buildDynamicUi(parameters: IBuildCommandParameters): Promise<void> {
  log.info(blueBright("Build dynamic UI schemas:", parameters.filter));
  log.debug("Parameters:", parameters);

  const descriptors: Array<TFolderReplicationDescriptor> = await getFolderReplicationDescriptors({
    fromDirectory: GAME_DATA_UI_DIR,
    toDirectory: TARGET_GAME_DATA_UI_DIR,
    fromExtension: EXPECTED_DYNAMIC_XML_EXTENSIONS,
    toExtension: EAssetExtension.XML,
    filters: parameters.filter,
  });

  if (descriptors.length) {
    log.info("Found dynamic UI XML configs:", descriptors.length);

    let processedXmlConfigs: number = 0;
    let skippedXmlConfigs: number = 0;

    createDirForConfigs(descriptors, log);

    await Promise.all(
      descriptors.map(async ([from, to]) => {
        const xmlSource = await import(from);
        const xmlContent = typeof xmlSource?.create === "function" && xmlSource?.create();

        if (xmlContent) {
          log.debug("TRANSFORM UI XML:", blue(to));
          await fsp.writeFile(to, renderJsxToXmlText(xmlContent));
          processedXmlConfigs += 1;
        } else {
          log.debug("SKIP, not valid UI XML source:", blue(from));
          skippedXmlConfigs += 1;
        }
      })
    );

    log.info("UI TSX files processed:", processedXmlConfigs);
    log.info("UI TSX files skipped:", skippedXmlConfigs);
  } else {
    log.info("No dynamic UI typescript configs found");
  }
}

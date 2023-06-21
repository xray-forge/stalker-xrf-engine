import * as fsPromises from "fs/promises";
import * as path from "path";

import { blue, blueBright } from "chalk";

import { IBuildCommandParameters } from "#/build/build";
import { GAME_DATA_UI_DIR, TARGET_GAME_DATA_UI_DIR } from "#/globals/paths";
import {
  createDirForConfigs,
  EAssetExtension,
  NodeLogger,
  readDirContent,
  TFolderFiles,
  TFolderReplicationDescriptor,
} from "#/utils";
import { renderJsxToXmlText } from "#/utils/xml";

const log: NodeLogger = new NodeLogger("BUILD_UI_DYNAMIC");

const EXPECTED_DYNAMIC_XML_EXTENSIONS: Array<EAssetExtension> = [EAssetExtension.TS, EAssetExtension.TSX];

/**
 * Build XML game forms from JSX forms.
 */
export async function buildDynamicUi(parameters: IBuildCommandParameters): Promise<void> {
  log.info(blueBright("Build dynamic UI schemas:", parameters.filter));
  log.debug("Parameters:", parameters);

  const xmlConfigs: Array<TFolderReplicationDescriptor> = await getUiConfigs(parameters.filter);

  if (xmlConfigs.length > 0) {
    log.info("Found dynamic XML configs");

    let processedXmlConfigs: number = 0;
    let skippedXmlConfigs: number = 0;

    createDirForConfigs(xmlConfigs, log);

    await Promise.all(
      xmlConfigs.map(async ([from, to]) => {
        const xmlSource = await import(from);
        const xmlContent = typeof xmlSource?.create === "function" && xmlSource?.create();

        if (xmlContent) {
          log.debug("TRANSFORM:", blue(to));
          await fsPromises.writeFile(to, renderJsxToXmlText(xmlContent));
          processedXmlConfigs += 1;
        } else {
          log.debug("SKIP, not valid XML source:", blue(from));
          skippedXmlConfigs += 1;
        }
      })
    );

    log.info("TSX files processed:", processedXmlConfigs);
    log.info("TSX files skipped:", skippedXmlConfigs);
  } else {
    log.info("No dynamic UI typescript configs found");
  }
}

/**
 * Get list of UI config files in engine source files.
 */
async function getUiConfigs(filters: Array<string> = []): Promise<Array<TFolderReplicationDescriptor>> {
  function collectXmlConfigs(
    acc: Array<TFolderReplicationDescriptor>,
    it: TFolderFiles
  ): Array<TFolderReplicationDescriptor> {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectXmlConfigs(acc, nested));
    } else if (EXPECTED_DYNAMIC_XML_EXTENSIONS.includes(path.extname(it) as EAssetExtension)) {
      const to: string = it.slice(GAME_DATA_UI_DIR.length).replace(/\.[^/.]+$/, "") + EAssetExtension.XML;

      // Filter.
      if (!filters.length || filters.some((filter) => it.match(filter))) {
        acc.push([it, path.join(TARGET_GAME_DATA_UI_DIR, to)]);
      }
    }

    return acc;
  }

  return (await readDirContent(GAME_DATA_UI_DIR)).reduce(collectXmlConfigs, []);
}

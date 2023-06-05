import * as fsPromises from "fs/promises";
import * as path from "path";

import { blue, blueBright } from "chalk";

import { GAME_DATA_LTX_CONFIGS_DIR, TARGET_GAME_DATA_CONFIGS_DIR } from "#/globals/paths";
import {
  createDirForConfigs,
  ILtxConfigDescriptor,
  NodeLogger,
  Optional,
  readDirContent,
  renderJsonToLtx,
  TFolderFiles,
  TFolderReplicationDescriptor,
} from "#/utils";

const log: NodeLogger = new NodeLogger("BUILD_CONFIGS_DYNAMIC");
const EXPECTED_DYNAMIC_XML_EXTENSIONS: Array<string> = [".ts"];

/**
 * Transform typescript config files to LTX configs.
 */
export async function buildDynamicConfigs(): Promise<void> {
  log.info(blueBright("Build dynamic configs"));

  const ltxConfigs: Array<TFolderReplicationDescriptor> = await getLtxConfigs();

  if (ltxConfigs.length > 0) {
    log.info("Found dynamic LTX configs");

    let processedXmlConfigs: number = 0;
    let skippedXmlConfigs: number = 0;

    createDirForConfigs(ltxConfigs, log);

    await Promise.all(
      ltxConfigs.map(async ([from, to]) => {
        const ltxSource = await import(from);
        const ltxContent: Optional<ILtxConfigDescriptor> =
          (ltxSource?.create || ltxSource?.config) &&
          (typeof ltxSource?.create === "function" ? ltxSource?.create() : ltxSource?.config);

        if (ltxContent) {
          log.debug("TRANSFORM:", blue(to));

          const filename: string = path.parse(to).base;

          await fsPromises.writeFile(to, renderJsonToLtx(filename, ltxContent));
          processedXmlConfigs += 1;
        } else {
          log.debug("SKIP, not valid LTX source:", blue(from));
          skippedXmlConfigs += 1;
        }
      })
    );

    log.info("TSX files processed:", processedXmlConfigs);
    log.info("TSX files skipped:", skippedXmlConfigs);
  } else {
    log.info("No dynamic LTX configs found");
  }
}

/**
 * Get list of LTX transformable descriptors.
 */
async function getLtxConfigs(): Promise<Array<TFolderReplicationDescriptor>> {
  function collectLtxConfigs(
    acc: Array<TFolderReplicationDescriptor>,
    it: TFolderFiles
  ): Array<TFolderReplicationDescriptor> {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectLtxConfigs(acc, nested));
    } else if (EXPECTED_DYNAMIC_XML_EXTENSIONS.includes(path.extname(it))) {
      const to: string = it.slice(GAME_DATA_LTX_CONFIGS_DIR.length).replace(/\.[^/.]+$/, "") + ".ltx";

      acc.push([it, path.join(TARGET_GAME_DATA_CONFIGS_DIR, to)]);
    }

    return acc;
  }

  return (await readDirContent(GAME_DATA_LTX_CONFIGS_DIR)).reduce(collectLtxConfigs, []);
}

import * as fs from "fs";
import * as fsp from "fs/promises";
import * as path from "path";

import { blue, blueBright, yellow } from "chalk";

import { GAME_DATA_UI_DIR, TARGET_PREVIEW_DIR } from "#/globals/paths";
import { generateHTMLPreviewFromXMLString } from "#/preview/utils/generate_preview";
import {
  EAssetExtension,
  NodeLogger,
  readDirContent,
  renderJsxToXmlText,
  TFolderFiles,
  TFolderReplicationDescriptor,
  TimeTracker,
} from "#/utils";

const log: NodeLogger = new NodeLogger("PREVIEW");
const EXPECTED_XML_EXTENSIONS: Array<EAssetExtension> = [EAssetExtension.TSX, EAssetExtension.TS, EAssetExtension.XML];

interface IGeneratePreviewCommandParameters {
  clean?: boolean;
  verbose?: boolean;
}

/**
 * Generate HTML previews from game XML forms for browser preview.
 */
export async function generatePreview(
  filters: Array<string>,
  parameters: IGeneratePreviewCommandParameters
): Promise<void> {
  const timeTracker: TimeTracker = new TimeTracker().start();

  NodeLogger.IS_VERBOSE = parameters.verbose === true;

  log.info("Compiling preview files");

  if (parameters.clean) {
    log.info("Clean destination:", yellow(TARGET_PREVIEW_DIR));
    fs.rmSync(TARGET_PREVIEW_DIR, { recursive: true, force: true });
  }

  if (filters.length) {
    log.info("Using filters:", filters);
  }

  const xmlConfigs: Array<TFolderReplicationDescriptor> = await getUiConfigs(filters);

  if (xmlConfigs.length > 0) {
    log.info("Found XML configs");

    createFoldersForConfigs(xmlConfigs);

    await Promise.all(
      xmlConfigs.map(async ([from, to]) => {
        if (from.endsWith(EAssetExtension.XML)) {
          const content: ArrayBuffer = await fsp.readFile(from);

          log.debug("COMPILE XML:", blue(to));

          await fsp.writeFile(to, generateHTMLPreviewFromXMLString(content.toString()));
        } else {
          const xmlSource = await import(from);
          const jsxContent = typeof xmlSource?.create === "function" && xmlSource.create();

          if (jsxContent) {
            log.debug("COMPILE JSX:", blue(to));
            await fsp.writeFile(to, generateHTMLPreviewFromXMLString(renderJsxToXmlText(jsxContent)));
          } else {
            log.debug("SKIP, not valid source:", blue(from));
          }
        }
      })
    );

    log.info("TSX files processed:", xmlConfigs.length);
  } else {
    log.info("No TSX configs found");
  }

  timeTracker.end();
  log.info("Preview compilation took:", timeTracker.getDuration() / 1000, "SEC");
}

/**
 * Sync way for folder creation when needed.
 */
function createFoldersForConfigs(xmlConfigs: Array<TFolderReplicationDescriptor>): void {
  xmlConfigs.forEach(([, to]) => {
    const targetDir: string = path.dirname(to);

    if (!fs.existsSync(targetDir)) {
      log.debug("MKDIR:", blueBright(targetDir));
      fs.mkdirSync(targetDir, { recursive: true });
    }
  });
}

/**
 * @returns list of files for preview generation
 */
async function getUiConfigs(filters: Array<string> = []): Promise<Array<TFolderReplicationDescriptor>> {
  /**
   * Collect list of xml configs for UI preview generation in a recursive way.
   */
  function collectXmlConfigs(
    acc: Array<TFolderReplicationDescriptor>,
    it: TFolderFiles
  ): Array<TFolderReplicationDescriptor> {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectXmlConfigs(acc, nested));
    } else if (EXPECTED_XML_EXTENSIONS.includes(path.extname(it) as EAssetExtension)) {
      const to: string = it.slice(GAME_DATA_UI_DIR.length).replace(/\.[^/.]+$/, "") + EAssetExtension.HTML;

      if (!filters.length || filters.some((filter) => it.match(filter))) {
        acc.push([it, path.join(TARGET_PREVIEW_DIR, to)]);
      }
    }

    return acc;
  }

  return (await readDirContent(GAME_DATA_UI_DIR)).reduce(collectXmlConfigs, []);
}

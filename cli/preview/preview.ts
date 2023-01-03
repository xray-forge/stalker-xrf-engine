import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";
import * as process from "process";

import { default as chalk } from "chalk";

import { TFolderFiles, TFolderReplicationDescriptor } from "@/mod/lib/types";

import { GAME_DATA_UI_DIR, TARGET_PREVIEW_DIR } from "#/build/globals";
import { generatePreview } from "#/preview/utils/generate_preview";
import { NodeLogger, readDirContent, renderJsxToXmlText, TimeTracker } from "#/utils";

const FILTERS: Array<string> = process.argv.slice(2).filter((it) => !it.trim().startsWith("--"));

const isCleanBuild: boolean = process.argv.includes("--clean");
const isVerboseBuild: boolean = process.argv.includes("--verbose");

const EXPECTED_XML_EXTENSIONS = [".tsx", ".xml"];
const log: NodeLogger = new NodeLogger("PREVIEW");

NodeLogger.IS_VERBOSE = isVerboseBuild;

(async function preview(): Promise<void> {
  const timeTracker: TimeTracker = new TimeTracker().start();

  log.info("Compiling preview files");

  if (isCleanBuild) {
    log.info("Clean destination:", chalk.yellow(TARGET_PREVIEW_DIR));
    fs.rmSync(TARGET_PREVIEW_DIR, { recursive: true, force: true });
  }

  if (FILTERS.length) {
    log.info("Using filters:", FILTERS);
  }

  const xmlConfigs: Array<TFolderReplicationDescriptor> = await getUiConfigs(FILTERS);

  if (xmlConfigs.length > 0) {
    log.info("Found XML configs");

    createFoldersForConfigs(xmlConfigs);

    await Promise.all(
      xmlConfigs.map(async ([from, to]) => {
        if (from.endsWith(".tsx")) {
          const xmlSource = await import(from);
          const jsxContent =
            from.endsWith(".tsx") &&
            typeof xmlSource?.create === "function" &&
            xmlSource?.IS_XML &&
            xmlSource?.create();

          if (jsxContent) {
            log.debug("COMPILE JSX:", chalk.blue(to));
            await fsPromises.writeFile(to, generatePreview(renderJsxToXmlText(jsxContent)));
          } else {
            log.debug("SKIP, not valid source:", chalk.blue(from));
          }
        } else {
          const content: ArrayBuffer = await fsPromises.readFile(from);

          log.debug("COMPILE XML:", chalk.blue(to));

          await fsPromises.writeFile(to, generatePreview(content.toString()));
        }
      })
    );

    log.info("TSX files processed:", xmlConfigs.length);
  } else {
    log.info("No TSX configs found");
  }

  timeTracker.end();
  log.info("Preview compilation took:", timeTracker.getDuration() / 1000, "SEC");
})();

/**
 * Sync way for folder creation when needed.
 */
function createFoldersForConfigs(xmlConfigs: Array<TFolderReplicationDescriptor>): void {
  xmlConfigs.forEach(([, to]) => {
    const targetDir: string = path.dirname(to);

    if (!fs.existsSync(targetDir)) {
      log.debug("MKDIR:", chalk.blueBright(targetDir));
      fs.mkdirSync(targetDir, { recursive: true });
    }
  });
}

async function getUiConfigs(filters: Array<string> = []): Promise<Array<TFolderReplicationDescriptor>> {
  function collectXmlConfigs(
    acc: Array<TFolderReplicationDescriptor>,
    it: TFolderFiles
  ): Array<TFolderReplicationDescriptor> {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectXmlConfigs(acc, nested));
    } else if (EXPECTED_XML_EXTENSIONS.includes(path.extname(it))) {
      const to: string = it.slice(GAME_DATA_UI_DIR.length).replace(/\.[^/.]+$/, "") + ".html";

      if (!filters.length || filters.some((filter) => it.match(filter))) {
        acc.push([it, path.join(TARGET_PREVIEW_DIR, to)]);
      }
    }

    return acc;
  }

  return (await readDirContent(GAME_DATA_UI_DIR)).reduce(collectXmlConfigs, []);
}

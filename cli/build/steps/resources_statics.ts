import * as fs from "fs";
import * as fsp from "fs/promises";
import * as path from "path";

import { blueBright, yellowBright } from "chalk";

import { IBuildCommandParameters } from "#/build/build";
import { default as config } from "#/config.json";
import { CLI_DIR, TARGET_GAME_DATA_DIR } from "#/globals/paths";
import { getDiffs, IDiffs, normalizeParameterPath, readFolderGen } from "#/utils/fs";
import { NodeLogger } from "#/utils/logging";
import { Optional } from "#/utils/types";

const log: NodeLogger = new NodeLogger("BUILD_ASSET_STATICS");

const GENERIC_FILES: Array<string> = ["README.md", "LICENSE", ".git", ".gitignore", ".gitattributes"];
const UNEXPECTED_DIRECTORIES: Array<string> = ["core", "configs", "forms,", "lib", "scripts"];

/**
 * Build mod statics from configured destinations.
 */
export async function buildResourcesStatics(parameters: IBuildCommandParameters): Promise<void> {
  log.info(blueBright("Build resources"));

  const configuredDefaultPath: string = path.resolve(
    CLI_DIR,
    normalizeParameterPath(config.resources.mod_assets_base_folder)
  );

  const configuredTargetPath: Array<string> = parameters.assetOverrides
    ? config.resources.mod_assets_override_folders.map((it) => path.resolve(CLI_DIR, normalizeParameterPath(it)))
    : [];

  if (parameters.assetOverrides && config.resources.mod_assets_locales[parameters.language]) {
    config.resources.mod_assets_locales[parameters.language].forEach((it) => {
      configuredTargetPath.push(path.resolve(CLI_DIR, normalizeParameterPath(it)));
    });
  } else {
    log.warn("No language resources detected for current locale");
  }

  const resourceFolders: Array<string> = [configuredDefaultPath, ...configuredTargetPath].filter((it) => {
    log.debug("Resources folder candidate check:", yellowBright(it));

    return fs.existsSync(it);
  });

  if (resourceFolders.length) {
    log.info("Process folders with resources:", resourceFolders.length);

    for (const folderPath of resourceFolders) {
      const sourcePaths: Array<string> = await validateResources(folderPath);

      for (const sourcePath of sourcePaths) {
        const relativePath: string = sourcePath.slice(folderPath.length);
        const targetDir: string = path.join(TARGET_GAME_DATA_DIR, relativePath);
        const isDirectory: boolean = (await fsp.stat(sourcePath)).isDirectory();

        if (isDirectory) {
          await copyStaticResources(sourcePath, targetDir, parameters.filter);
        } else {
          await copyStaticResource(sourcePath, targetDir, parameters.filter);
        }
      }
    }
  } else {
    log.info("No resources sources found");
  }
}

/**
 * Get valid resources paths from provided folder directory.
 */
async function validateResources(folderPath: string): Promise<Array<string>> {
  const dirents: Array<fs.Dirent> = await fsp.readdir(folderPath, { withFileTypes: true });
  const allowFiles = (dirent: fs.Dirent): Optional<string> => {
    const name: string = dirent.name;

    if (dirent.isDirectory()) {
      // Do not allow copy of folders that overlap with auto-generated code.
      if (UNEXPECTED_DIRECTORIES.includes(name)) {
        throw new Error(`Provided not expected directory for resources copy: '${name}'.`);
      }

      // Do not copy hidden folders.
      if (name.startsWith(".")) {
        return null;
      }

      return path.join(folderPath, name);
    }

    if (!GENERIC_FILES.includes(name)) {
      return path.join(folderPath, name);
    }

    return null;
  };

  return dirents.map(allowFiles).filter(Boolean);
}

/**
 * Copy provided asset resource.
 */
async function copyStaticResource(from: string, to: string, filters: Array<string> = []): Promise<void> {
  if (!filters.length || filters.some((filter) => from.match(filter))) {
    log.debug("CP:", yellowBright(from), "=>", yellowBright(to));
    await fsp.cp(from, to);
  } else {
    log.debug("SKIP:", yellowBright(from), "=>", yellowBright(to));
  }
}

/**
 * Copy provided assets directory resources if directory exists.
 */
async function copyStaticResources(from: string, to: string, filters: Array<string> = []): Promise<void> {
  const diffs: IDiffs = await getDiffs(from, to);
  const prefixLen: number = from.length + path.sep.length;
  const additions: Set<string> = new Set(diffs.additions.files.map(path.normalize));

  for await (const filePath of readFolderGen(from)) {
    const relPath: string = filePath.slice(prefixLen);
    const fromFile: string = path.join(from, relPath);
    const toFile: string = path.join(to, relPath);

    if (filters.length && !filters.some((filter) => fromFile.match(filter))) {
      log.debug("FILTERED OUT:", yellowBright(fromFile), "=>", yellowBright(to));
      continue;
    }

    if (!additions.has(relPath)) {
      log.debug("SKIP NO DIFF:", yellowBright(fromFile));
      continue;
    }

    log.debug("CP:", yellowBright(fromFile), "=>", yellowBright(to));
    await fsp.cp(fromFile, toFile);
  }
}

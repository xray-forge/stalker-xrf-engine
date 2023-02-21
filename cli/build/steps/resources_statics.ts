import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";

import { default as chalk } from "chalk";

import { default as config } from "#/config.json";
import { CLI_DIR, TARGET_GAME_DATA_DIR } from "#/globals";
import { NodeLogger } from "#/utils";

const log: NodeLogger = new NodeLogger("BUILD_ASSET_STATICS");
const EXPECTED_FILES: Array<string> = ["README.md", "LICENSE", ".git", ".gitignore", ".gitattributes"];
const UNEXPECTED_DIRECTORIES: Array<string> = ["configs", "globals,", "lib", "scripts"];

export async function buildResourcesStatics(): Promise<void> {
  const configuredTargetPath: string = path.resolve(CLI_DIR, config.resources.MOD_ASSETS_FOLDER);
  const configuredFallbackPath: string = path.resolve(CLI_DIR, config.resources.MOD_ASSETS_FALLBACK_FOLDER);

  const resourcesFolderPath: string = fs.existsSync(configuredTargetPath)
    ? configuredTargetPath
    : configuredFallbackPath;
  const resourcesExist: boolean = fs.existsSync(resourcesFolderPath);

  log.info(chalk.blueBright("Copy raw assets from:", resourcesFolderPath));

  if (resourcesExist) {
    const contentFolders: Array<string> = await Promise.all(
      (
        await fsPromises.readdir(resourcesFolderPath, { withFileTypes: true })
      )
        .map((dirent) => {
          if (dirent.isDirectory()) {
            // Do not allow copy of folders that overlap with auto-generated code.
            if (UNEXPECTED_DIRECTORIES.includes(dirent.name)) {
              throw new Error("Provided not expected directory for resources copy.");
              // Do not copy hidden folders.
            } else if (dirent.name.startsWith(".")) {
              return null;
            }

            return path.join(resourcesFolderPath, dirent.name);
          }

          if (!EXPECTED_FILES.includes(dirent.name)) {
            log.warn(`Unexpected file in resources folder: '${dirent.name}'. It will be ignored.`);
          }

          return null;
        })
        .filter(Boolean)
    );

    log.info("Copy assets folders");

    await Promise.all(
      contentFolders.map(async (it) => {
        const relativePath: string = it.slice(resourcesFolderPath.length);
        const targetDir: string = path.join(TARGET_GAME_DATA_DIR, relativePath);

        log.debug("CP -R:", chalk.yellow(targetDir));

        return fsPromises.cp(it, targetDir, { recursive: true });
      })
    );

    log.info("Resource folders processed:", contentFolders.length);
  } else {
    log.info("No static resources detected");
  }
}

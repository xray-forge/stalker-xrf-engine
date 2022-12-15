import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";

import { RESOURCES_DIR, TARGET_GAME_DATA_DIR } from "#/build/build_globals";
import { Logger } from "#/utils";

const log: Logger = new Logger("BUILD_ASSET_STATICS");
const EXPECTED_FILES: Array<string> = [ "README.md" ];

export async function buildResourcesStatics(): Promise<void> {
  log.info("Copy raw assets");

  const resourcesExist: boolean = fs.existsSync(RESOURCES_DIR);

  if (resourcesExist) {
    const contentFolders: Array<string> = await Promise.all(
      (
        await fsPromises.readdir(RESOURCES_DIR, { withFileTypes: true })
      )
        .map((dirent) => {
          if (dirent.isDirectory()) {
            return path.join(RESOURCES_DIR, dirent.name);
          }

          if (!EXPECTED_FILES.includes(dirent.name)) {
            log.warn(`Unexpected file in resources folder: '${dirent.name}'. It will be ignored.`);
          }

          return null;
        })
        .filter(Boolean)
    );

    log.info("Copy folders:", contentFolders.length);

    await Promise.all(
      contentFolders.map(async (it) => {
        const relativePath: string = it.slice(RESOURCES_DIR.length);
        const targetDir: string = path.join(TARGET_GAME_DATA_DIR, relativePath);

        log.info("Copy folder:", targetDir);

        return fsPromises.cp(it, targetDir, { recursive: true });
      })
    );

    log.info(contentFolders.length, "resource folders processed");
  } else {
    log.info("No static resources detected");
  }
}

import * as fsPromises from "fs/promises";

import {
  GAME_DATA_METADATA_FILE, TARGET_GAME_DATA_DIR,
  TARGET_GAME_DATA_METADATA_FILE
} from "./build_globals";

import { Logger, readDirContent } from "#/utils";

const log: Logger = new Logger("BUILD_META");

export async function buildMeta(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const meta: Record<string, unknown> = require(GAME_DATA_METADATA_FILE);

  const collectFiles = (acc, it) => {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectFiles(acc, nested));
    } else {
      acc.push(it);
    }

    return acc;
  };

  const builtFiles:Array<string> = (await readDirContent(TARGET_GAME_DATA_DIR)).reduce(collectFiles, []);
  const assetsSizeBytes: number = (await Promise.all(builtFiles.map((it) => fsPromises.stat(it))))
    .reduce((acc, it) => acc + it.size, 0);
  const assetsSizesMegabytes: string = (assetsSizeBytes / 1024 / 1024).toFixed(3);

  log.info("Collecting gamedata meta:", TARGET_GAME_DATA_DIR);
  log.info("Collected files count:", builtFiles.length);
  log.info("Collected files size:", assetsSizesMegabytes, "MB");

  meta["built_at"] = (new Date()).toLocaleString();
  meta["files_size"] = assetsSizesMegabytes + " MB";
  meta["files_count"] = builtFiles.length;
  meta["files"] = builtFiles.map((it) => it.slice(TARGET_GAME_DATA_DIR.length + 1));

  await fsPromises.writeFile(TARGET_GAME_DATA_METADATA_FILE, JSON.stringify(meta, null, 2));

  log.info("Included mod metadata");
}

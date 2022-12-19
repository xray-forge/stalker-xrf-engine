import fs from "fs";
import * as fsPromises from "fs/promises";
import * as os from "os";

import { default as chalk } from "chalk";

import { TARGET_GAME_DATA_DIR, TARGET_GAME_DATA_METADATA_FILE } from "../globals";

import { Logger, readDirContent, TimeTracker } from "#/utils";

const log: Logger = new Logger("META");

interface IBuildMetaParams {
  meta: Record<string, unknown>;
  timeTracker: TimeTracker;
}

export async function buildMeta({ meta, timeTracker }: IBuildMetaParams): Promise<void> {
  log.info("Build metadata");

  const buildMeta: Record<string, unknown> = { ...meta };

  const collectFiles = (acc, it) => {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectFiles(acc, nested));
    } else {
      acc.push(it);
    }

    return acc;
  };

  if (!fs.existsSync(TARGET_GAME_DATA_DIR)) {
    fs.mkdirSync(TARGET_GAME_DATA_DIR);
  }

  const builtFiles: Array<string> = (await readDirContent(TARGET_GAME_DATA_DIR)).reduce(collectFiles, []);
  const assetsSizeBytes: number = (await Promise.all(builtFiles.map((it) => fsPromises.stat(it)))).reduce(
    (acc, it) => acc + it.size,
    0
  );
  const assetsSizesMegabytes: string = (assetsSizeBytes / 1024 / 1024).toFixed(3);

  log.info("Collecting gamedata meta:", chalk.yellowBright(TARGET_GAME_DATA_DIR));
  log.info("Collected files count:", builtFiles.length);
  log.info("Collected files size:", chalk.yellow(assetsSizesMegabytes), "MB");

  buildMeta["built_took"] = timeTracker.getDuration() / 1000 + " SEC";
  buildMeta["built_at"] = new Date().toLocaleString();
  buildMeta["build_flags"] = process.argv;
  buildMeta["build_timings"] = getTimingsInfo(timeTracker);

  Object.assign(buildMeta, getBuildSystemInfo());

  buildMeta["files_size"] = assetsSizesMegabytes + " MB";
  buildMeta["files_count"] = builtFiles.length;
  buildMeta["files"] = builtFiles.map((it) => it.slice(TARGET_GAME_DATA_DIR.length + 1));

  await fsPromises.writeFile(TARGET_GAME_DATA_METADATA_FILE, JSON.stringify(buildMeta, null, 2));

  log.info("Included mod metadata");
}

export function getTimingsInfo(timeTracker: TimeTracker): Record<string, string | number> {
  const total: number = timeTracker.getDuration();

  return Object.entries(timeTracker.getStats()).reduce((acc, [key, value]) => {
    acc[key] = `${(value / (total / 100)).toFixed(1)}% ${value / 1000} SEC`;

    return acc;
  }, {});
}

export function getBuildSystemInfo(): Record<string, string | number> {
  const cpuInfos = os.cpus();

  return {
    ["os_system"]: os.type(),
    ["os_platform"]: os.platform(),
    ["os_arch"]: os.arch(),
    ["os_cpus"]: cpuInfos.length,
    ["os_cpus_type"]: cpuInfos.length ? cpuInfos[0].model : "",
    ["os_ram_max"]: os.totalmem() / 1024 / 1024 + " MB",
    ["os_hostname"]: os.hostname()
  };
}

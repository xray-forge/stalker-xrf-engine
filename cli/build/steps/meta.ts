import * as fs from "fs";
import * as fsp from "fs/promises";
import * as os from "os";
import * as path from "path";

import { blueBright, yellow, yellowBright } from "chalk";

import { TARGET_GAME_DATA_DIR, TARGET_GAME_DATA_METADATA_FILE } from "#/globals/paths";
import { readDirContent } from "#/utils/fs/read_dir_content";
import { transformBytesToMegabytes } from "#/utils/fs/transform";
import { TDirectoryFilesTree } from "#/utils/fs/types";
import { getCommitHash } from "#/utils/git";
import { NodeLogger } from "#/utils/logging";
import { TimeTracker } from "#/utils/timing";

const log: NodeLogger = new NodeLogger("META");

interface IBuildMetaParams {
  meta: Record<string, unknown>;
  timeTracker: TimeTracker;
}

/**
 * Step to collect metadata in a single file with timing metrics.
 */
export async function buildMeta({ meta, timeTracker }: IBuildMetaParams): Promise<void> {
  log.info(blueBright("Build metadata"));

  const buildMeta: Record<string, unknown> = {};

  /**
   * Collect list of built files.
   */
  function collectFiles(acc, it): Array<Array<string>> {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectFiles(acc, nested));
    } else {
      acc.push(it);
    }

    return acc;
  }

  if (!fs.existsSync(TARGET_GAME_DATA_DIR)) {
    fs.mkdirSync(TARGET_GAME_DATA_DIR);
  }

  const directoryTree: TDirectoryFilesTree = await readDirContent(TARGET_GAME_DATA_DIR);
  const builtFiles: Array<string> = directoryTree.reduce(collectFiles, []);
  const assetsSizeBytes: number = (await Promise.all(builtFiles.map((it) => fsp.stat(it)))).reduce(
    (acc, it) => acc + it.size,
    0
  );

  const assetsSizesMegabytes: number = transformBytesToMegabytes(assetsSizeBytes);

  log.info("Collecting gamedata meta:", yellowBright(TARGET_GAME_DATA_DIR));
  log.info("Collected files count:", builtFiles.length);
  log.info("Collected files size:", yellow(assetsSizesMegabytes), "MB");

  const timingInfo: Record<string, string | number> = getTimingsInfo(timeTracker);

  buildMeta["name"] = meta.name;
  buildMeta["version"] = meta.version;
  buildMeta["author"] = meta.author;
  buildMeta["repository"] = meta.repository;
  buildMeta["commit"] = getCommitHash();
  buildMeta["built_took"] = timeTracker.getDuration() / 1000 + " SEC";
  buildMeta["built_took"] = timeTracker.getDuration() / 1000 + " SEC";
  buildMeta["built_at"] = new Date().toLocaleString();
  buildMeta["build_flags"] = process.argv.slice(2);
  buildMeta["build_timings"] = timingInfo;

  Object.assign(buildMeta, getBuildSystemInfo());

  buildMeta["files_size"] = assetsSizesMegabytes + " MB";
  buildMeta["files_count"] = builtFiles.length;
  buildMeta["files_summary"] = await getFolderSizesSummary(builtFiles);
  buildMeta["files"] = builtFiles.map((it) => it.slice(TARGET_GAME_DATA_DIR.length + 1));

  await fsp.writeFile(TARGET_GAME_DATA_METADATA_FILE, JSON.stringify(buildMeta, null, 2));

  log.info("Timing stats:");
  Object.entries(timingInfo).forEach(([key, value]) => log.info(`* ${key}:  ${yellow(value)}`));

  log.info("Included engine mod metadata:", yellowBright(TARGET_GAME_DATA_METADATA_FILE));
}

/**
 * Get pretty displayed stats descriptor object of time performance based on time tracker.
 */
export function getTimingsInfo(timeTracker: TimeTracker): Record<string, string | number> {
  const total: number = timeTracker.getDuration();

  return Object.entries(timeTracker.getStats()).reduce((acc, [key, value]) => {
    acc[key] = `${(value / (total / 100)).toFixed(1)}% ${value / 1000} SEC`;

    return acc;
  }, {});
}

/**
 * Get approx sizing of the folder tree.
 */
export async function getFolderSizesSummary(directoryTree: Array<string>): Promise<Record<string, string>> {
  const statistics: Record<string, number> = {};

  await Promise.all(
    directoryTree.map(async (it) => {
      const fileSize: number = (await fsp.stat(it)).size;
      const base: string = it.slice(TARGET_GAME_DATA_DIR.length + 1);
      const baseFolder: string = path.dirname(base).split(/[/\\]/)[0];
      const key: string = baseFolder === "." ? base : baseFolder;

      statistics[key] = (statistics[key] || 0) + fileSize;
    })
  );

  return Object.entries(statistics).reduce((acc, [key, value]) => {
    acc[key] = transformBytesToMegabytes(value) + " MB";

    return acc;
  }, {});
}

/**
 * Get pretty displayed description of build system info.
 */
export function getBuildSystemInfo(): Record<string, string | number> {
  const cpuInfos: Array<os.CpuInfo> = os.cpus();

  return {
    ["os_system"]: os.type(),
    ["os_platform"]: os.platform(),
    ["os_arch"]: os.arch(),
    ["os_cpus"]: cpuInfos.length,
    ["os_cpus_type"]: cpuInfos.length ? cpuInfos[0].model : "",
    ["os_ram_max"]: os.totalmem() / 1024 / 1024 + " MB",
    ["os_hostname"]: os.hostname(),
    ["os_user"]: os.userInfo()?.username,
  };
}

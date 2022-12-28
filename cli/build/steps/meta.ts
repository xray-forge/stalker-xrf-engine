import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as os from "os";
import * as path from "path";

import { default as chalk } from "chalk";

import { TARGET_GAME_DATA_DIR, TARGET_GAME_DATA_METADATA_FILE } from "../globals";

import { NodeLogger, readDirContent, TDirectoryFilesTree, TimeTracker } from "#/utils";

const log: NodeLogger = new NodeLogger("META");

interface IBuildMetaParams {
  meta: Record<string, unknown>;
  timeTracker: TimeTracker;
}

export async function buildMeta({ meta, timeTracker }: IBuildMetaParams): Promise<void> {
  log.info(chalk.blueBright("Build metadata"));

  const buildMeta: Record<string, unknown> = {};

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

  const directoryTree: TDirectoryFilesTree = await readDirContent(TARGET_GAME_DATA_DIR);
  const builtFiles: Array<string> = directoryTree.reduce(collectFiles, []);
  const assetsSizeBytes: number = (await Promise.all(builtFiles.map((it) => fsPromises.stat(it)))).reduce(
    (acc, it) => acc + it.size,
    0
  );

  const assetsSizesMegabytes: string = transformBytesToMegabytes(assetsSizeBytes);

  log.info("Collecting gamedata meta:", chalk.yellowBright(TARGET_GAME_DATA_DIR));
  log.info("Collected files count:", builtFiles.length);
  log.info("Collected files size:", chalk.yellow(assetsSizesMegabytes), "MB");

  const timingInfo: Record<string, string | number> = getTimingsInfo(timeTracker);

  buildMeta["name"] = meta.name;
  buildMeta["version"] = meta.version;
  buildMeta["author"] = meta.author;
  buildMeta["repository"] = meta.repository;
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

  await fsPromises.writeFile(TARGET_GAME_DATA_METADATA_FILE, JSON.stringify(buildMeta, null, 2));

  log.info("Timing stats:");
  Object.entries(timingInfo).forEach(([key, value]) => log.info(`* ${key}:  ${chalk.yellow(value)}`));

  log.info("Included mod metadata");
}

export function getTimingsInfo(timeTracker: TimeTracker): Record<string, string | number> {
  const total: number = timeTracker.getDuration();

  return Object.entries(timeTracker.getStats()).reduce((acc, [key, value]) => {
    acc[key] = `${(value / (total / 100)).toFixed(1)}% ${value / 1000} SEC`;

    return acc;
  }, {});
}

function transformBytesToMegabytes(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(3);
}

export async function getFolderSizesSummary(directoryTree: Array<string>): Promise<Record<string, string>> {
  const statistics: Record<string, number> = {};

  await Promise.all(
    directoryTree.map(async (it) => {
      const fileSize: number = (await fsPromises.stat(it)).size;
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

export function getBuildSystemInfo(): Record<string, string | number> {
  const cpuInfos = os.cpus();

  return {
    ["os_system"]: os.type(),
    ["os_platform"]: os.platform(),
    ["os_arch"]: os.arch(),
    ["os_cpus"]: cpuInfos.length,
    ["os_cpus_type"]: cpuInfos.length ? cpuInfos[0].model : "",
    ["os_ram_max"]: os.totalmem() / 1024 / 1024 + " MB",
    ["os_hostname"]: os.hostname(),
    ["os_user"]: os.userInfo()?.username
  };
}

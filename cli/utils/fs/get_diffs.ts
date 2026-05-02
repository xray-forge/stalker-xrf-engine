import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

interface IFileStat {
  modified: Date;
  size: number;
}

type TFileMap = Record<string, IFileStat>;

type TFilePathMap = TFileMap;

interface IFileStats {
  totalSize: number;
  files: TFileMap;
}

interface IDiffOptions {
  exclusions: Array<string>;
  compareSizes: boolean;
}

export interface IDiff {
  totalSize: number;
  files: string[];
}

export interface IDiffs {
  additions: IDiff;
  deletions: IDiff;
}

/**
 * Get time value from date or date string.
 *
 * @param dateOrDateString - serialized date or date instance
 * @returns timestamp parsed from date
 */
function getTime(dateOrDateString: Date | string): number {
  return typeof dateOrDateString === "string" ? Date.parse(dateOrDateString) : dateOrDateString.getTime();
}

/**
 * Make sure directory is accessible.
 * If cannot access it, generate subtree in a recursive way.
 *
 * @param directory - path to directory
 * @returns promise for ensuring directory is accessible
 */
async function ensureDirAccess(directory: string): Promise<void> {
  try {
    await fsp.access(directory);
  } catch {
    await fsp.mkdir(directory, { recursive: true });
  }
}

/**
 * Get files from some directory with async generator.
 *
 * @yields - files from directory in a recursive way
 */
async function* getFiles(directory: string): AsyncGenerator<string> {
  const dirents = await fsp.readdir(directory, { withFileTypes: true });

  for (const dirent of dirents) {
    const file = path.resolve(directory, dirent.name);

    if (dirent.isDirectory()) yield* getFiles(file);
    else yield file;
  }
}

/**
 * Get file stats for file by path.
 *
 * @param file - full path to file
 * @param options - configuration of stats access
 * @param options.exclusions - exclusions list
 * @param options.pathSeparator - separator of paths
 * @param options.encodePath - whether path should be encoded
 * @returns promise resolving file stats
 */
async function getFileStats(
  file: string,
  options: { exclusions?: Array<string>; pathSeparator?: string; encodePath?: boolean }
): Promise<IFileStats> {
  const dir = path.resolve(file);

  await ensureDirAccess(dir);

  const { exclusions = [], pathSeparator = path.posix.sep, encodePath = false } = options;

  const fileStats: IFileStats = {
    totalSize: 0,
    files: {},
  };

  for await (const filePath of getFiles(dir)) {
    if (exclusions.some((path) => filePath.includes(path))) {
      continue;
    }

    const stats: fs.Stats = await fsp.stat(filePath);
    const relativeFilePath: string = filePath.slice(dir.length + 1);
    const posixPath: string =
      os.platform() === "win32" ? relativeFilePath.split(path.sep).join(pathSeparator) : relativeFilePath;

    fileStats.totalSize += stats.size;
    fileStats.files[encodePath ? encodeURIComponent(posixPath) : posixPath] = {
      modified: stats.mtime,
      size: stats.size,
    };
  }

  return fileStats;
}

/**
 * Get diff between two sets of files.
 *
 * @param base - base to check diffs from
 * @param target - target to check diffs from base
 * @param options - diff checking configuration
 * @returns promise resolving diffs between two sets of files
 */
export async function getDiffs(
  base: string | TFilePathMap,
  target: string | TFilePathMap,
  options?: IDiffOptions
): Promise<IDiffs> {
  const { exclusions = [], compareSizes = true } = options || {};

  let baseFiles: TFilePathMap;
  let targetFilesGz: TFilePathMap;

  if (typeof base === "string") {
    const baseRepo: string = path.resolve(base);
    const { files } = await getFileStats(baseRepo, { exclusions });

    baseFiles = files;
  } else {
    baseFiles = base;
  }

  if (typeof target === "string") {
    const targetRepo = path.resolve(target);
    const { files } = await getFileStats(targetRepo, { exclusions });

    targetFilesGz = files;
  } else {
    targetFilesGz = target;
  }

  const targetFiles: TFilePathMap = {};

  for (const path of Object.keys(targetFilesGz)) {
    let noGzPath = path;

    if (path.endsWith(".gz")) noGzPath = path.replace(".gz", "");

    targetFiles[noGzPath] = targetFilesGz[path];
  }

  const additions: IDiff = {
    totalSize: 0,
    files: [],
  };

  for (const path of Object.keys(baseFiles)) {
    const hasNoFile: boolean = targetFiles[path] === undefined;
    const baseFileStats: IFileStat = baseFiles[path];

    if (hasNoFile) {
      additions.totalSize += baseFileStats.size;
      additions.files.push(path);
    } else {
      const { modified: baseDate, size: baseSize } = baseFileStats;
      const { modified: targetDate, size: targetSize } = targetFiles[path];
      const baseDateModified = getTime(baseDate);
      const targetDateModified = getTime(targetDate);
      const isTargetObsolete = targetDateModified < baseDateModified;
      const comparison = compareSizes ? isTargetObsolete || baseSize !== targetSize : isTargetObsolete;

      if (comparison) {
        additions.totalSize += baseFileStats.size;
        additions.files.push(path);
      }
    }
  }

  const deletions: IDiff = {
    totalSize: 0,
    files: [],
  };

  for (const path of Object.keys(targetFiles)) {
    if (baseFiles[path] === undefined) {
      deletions.totalSize += targetFiles[path].size;
      deletions.files.push(path);
    }
  }

  return { additions, deletions };
}

import * as fsp from "fs/promises";
import * as os from "os";
import * as path from "path";

interface FileStat {
  mtime: Date;
  size: number;
}

type FileMap = Record<string, FileStat>;

type FilePathMap = string | FileMap;

interface FileStats {
  totalSize: number;
  files: FileMap;
}

interface DiffOptions {
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

function getTime(dateOrDateStr: Date | string): number {
  return typeof dateOrDateStr === "string" ? Date.parse(dateOrDateStr) : dateOrDateStr.getTime();
}

async function ensureDirAccess(directory: string): Promise<void> {
  try {
    await fsp.access(directory);
  } catch {
    await fsp.mkdir(directory, { recursive: true });
  }
}

async function* getFiles(directory: string): AsyncGenerator<string> {
  const dirents = await fsp.readdir(directory, { withFileTypes: true });

  for (const dirent of dirents) {
    const file = path.resolve(directory, dirent.name);

    if (dirent.isDirectory()) yield* getFiles(file);
    else yield file;
  }
}

async function getFileStats(directory: string, options): Promise<FileStats> {
  const dir = path.resolve(directory);

  await ensureDirAccess(dir);

  const { exclusions = [], pathSeparator = path.posix.sep, encodePath = false } = options;
  const fileStats = {
    totalSize: 0,
    files: {},
  };

  for await (const filePath of getFiles(dir)) {
    if (exclusions.some((path) => filePath.includes(path))) {
      continue;
    }

    const stats = await fsp.stat(filePath);
    const relativeFilePath = filePath.slice(dir.length + 1);
    const posixPath =
      os.platform() === "win32" ? relativeFilePath.split(path.sep).join(pathSeparator) : relativeFilePath;

    fileStats.totalSize += stats.size;
    fileStats.files[encodePath ? encodeURIComponent(posixPath) : posixPath] = {
      modified: stats.mtime,
      size: stats.size,
    };
  }

  return fileStats;
}

export async function getDiffs(base: FilePathMap, target: FilePathMap, options?: DiffOptions): Promise<IDiffs> {
  const { exclusions = [], compareSizes = true } = options || {};
  const statsOptions = { exclusions };
  let baseFiles = base;
  let targetFilesGz = target;

  if (typeof base === "string") {
    const baseRepo = path.resolve(base);
    const { files } = await getFileStats(baseRepo, statsOptions);

    baseFiles = files;
  }

  if (typeof target === "string") {
    const targetRepo = path.resolve(target);
    const { files } = await getFileStats(targetRepo, statsOptions);

    targetFilesGz = files;
  }

  const targetFiles = {};

  for (const path of Object.keys(targetFilesGz)) {
    let noGzPath = path;

    if (path.endsWith(".gz")) noGzPath = path.replace(".gz", "");

    targetFiles[noGzPath] = targetFilesGz[path];
  }

  const additions = {
    totalSize: 0,
    files: [],
  };

  for (const path of Object.keys(baseFiles)) {
    const noFile = targetFiles[path] === undefined;
    const baseFileStats = baseFiles[path];

    if (noFile) {
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

  const deletions = {
    totalSize: 0,
    files: [],
  };

  for (const path in targetFiles) {
    if (baseFiles[path] === undefined) {
      deletions.totalSize += targetFiles[path].size;
      deletions.files.push(path);
    }
  }

  return { additions, deletions };
}

import * as path from "path";

import { readDirContent } from "#/utils/fs/read_dir_content";
import { EAssetExtension, TFolderFiles, TFolderReplicationDescriptor } from "#/utils/types";

interface IFolderReplicationDescriptorsConfig {
  fromDirectory: string;
  toDirectory: string;
  fromExtension: EAssetExtension | Array<EAssetExtension>;
  toExtension: EAssetExtension;
  filters?: Array<string>;
}

/**
 * @returns list of replication descriptors based on configuration
 */
export async function getFolderReplicationDescriptors({
  fromDirectory,
  toDirectory,
  filters = [],
  fromExtension,
  toExtension,
}: IFolderReplicationDescriptorsConfig): Promise<Array<TFolderReplicationDescriptor>> {
  /**
   * Collect list of configs for further transformation in typescript.
   * Recursively find all ts files in configs dir.
   */
  function collectConfigs(
    acc: Array<TFolderReplicationDescriptor>,
    it: TFolderFiles
  ): Array<TFolderReplicationDescriptor> {
    if (Array.isArray(it)) {
      it.forEach((nested) => collectConfigs(acc, nested));
    } else if (
      // Support `from` search with multiple elements.
      Array.isArray(fromExtension)
        ? fromExtension.includes(path.extname(it) as EAssetExtension)
        : path.extname(it) === fromExtension
    ) {
      const to: string = it.slice(fromDirectory.length).replace(/\.[^/.]+$/, "") + toExtension;

      // Filter by matching.
      if (!filters.length || filters.some((filter) => it.match(filter))) {
        acc.push([it, path.join(toDirectory, to)]);
      }
    }

    return acc;
  }

  return (await readDirContent(fromDirectory)).reduce(collectConfigs, []);
}

import * as path from "node:path";

import { describe, expect, it, jest } from "@jest/globals";

import { getFolderReplicationDescriptors } from "#/build/utils/get_folder_replication_descrtiptors";
import { readDirContent } from "#/utils/fs/read_dir_content";
import { TDirectoryFilesTree } from "#/utils/fs/types";
import { EAssetExtension } from "#/utils/types";

jest.mock("#/utils/fs/read_dir_content");

const SOURCE_DIR: string = "source";
const TARGET_DIR: string = "target";

const FILES: TDirectoryFilesTree = [
  path.join(SOURCE_DIR, "logic.ltx"),
  path.join(SOURCE_DIR, "logic.ltx.test.ts"),
  path.join(SOURCE_DIR, "logic.ts"),
  path.join(SOURCE_DIR, "logic.test.ts"),
];

describe("getFolderReplicationDescriptors", () => {
  it("should exclude colocated tests from static configs and generated scripts", async () => {
    jest.mocked(readDirContent).mockResolvedValue(FILES);

    await expect(
      getFolderReplicationDescriptors({
        fromDirectory: SOURCE_DIR,
        toDirectory: TARGET_DIR,
        fromExtension: EAssetExtension.LTX,
        toExtension: EAssetExtension.LTX,
      })
    ).resolves.toEqual([[path.join(SOURCE_DIR, "logic.ltx"), path.join(TARGET_DIR, "logic.ltx")]]);

    await expect(
      getFolderReplicationDescriptors({
        fromDirectory: SOURCE_DIR,
        toDirectory: TARGET_DIR,
        fromExtension: EAssetExtension.TS,
        toExtension: EAssetExtension.LTX,
      })
    ).resolves.toEqual([[path.join(SOURCE_DIR, "logic.ts"), path.join(TARGET_DIR, "logic.ltx")]]);
  });
});

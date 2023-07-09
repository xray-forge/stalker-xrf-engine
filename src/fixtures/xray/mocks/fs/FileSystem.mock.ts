import * as path from "path";

import { jest } from "@jest/globals";

import { AnyObject, Optional, TPath } from "@/engine/lib/types";
import { MockFileSystemList } from "@/fixtures/xray/mocks/fs/FileSystemList.mock";
import { FS_MOCKS } from "@/fixtures/xray/mocks/fs/fs.mock";

/**
 * Mock engine FS manager.
 */
export class MockFileSystem {
  public static FS_ClampExt: number = 4;
  public static FS_ListFiles: number = 1;
  public static FS_ListFolders: number = 2;
  public static FS_RootOnly: number = 8;
  public static FS_sort_by_modif_down: number = 5;
  public static FS_sort_by_modif_up: number = 4;
  public static FS_sort_by_name_down: number = 1;
  public static FS_sort_by_name_up: number = 0;
  public static FS_sort_by_size_down: number = 3;
  public static FS_sort_by_size_up: number = 2;

  private static instance: Optional<MockFileSystem> = null;

  public static getInstance(): MockFileSystem {
    if (!this.instance) {
      this.instance = new MockFileSystem();
    }

    return this.instance;
  }

  public mocks: AnyObject;

  public constructor(mocks: AnyObject = FS_MOCKS) {
    this.mocks = mocks;
  }

  public setMock(root: string, path: string, isExisting: boolean = true): void {
    if (!this.mocks[root]) {
      this.mocks[root] = {};
    }

    this.mocks[root][path] = isExisting;
  }

  public file_list_open_ex = jest.fn(() => new MockFileSystemList());

  public file_delete = jest.fn(() => {});

  public update_path = jest.fn((base: TPath, part: TPath) => path.join(base, part));

  public exist = jest.fn((root: string, path: string) => {
    return Boolean(this.mocks[root] && this.mocks[root][path]);
  });
}

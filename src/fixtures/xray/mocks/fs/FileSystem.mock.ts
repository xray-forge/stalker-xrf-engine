import { jest } from "@jest/globals";

import { AnyObject, Optional } from "@/engine/lib/types";
import { FS_MOCKS } from "@/fixtures/xray/mocks/fs/fs.mock";

/**
 * Mock engine FS manager.
 */
export class MockFileSystem {
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

  public exist = jest.fn((root: string, path: string) => {
    return Boolean(this.mocks[root] && this.mocks[root][path]);
  });
}

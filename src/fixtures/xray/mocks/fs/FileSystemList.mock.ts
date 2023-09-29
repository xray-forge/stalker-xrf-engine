import { TCount } from "@/engine/lib/types";

/**
 * List of files mocked.
 */
export class MockFileSystemList {
  public list: Array<unknown>;

  public constructor(list: Array<string> = []) {
    this.list = list;
  }

  public Size(): TCount {
    return this.list.length;
  }

  public Sort(): void {}
}

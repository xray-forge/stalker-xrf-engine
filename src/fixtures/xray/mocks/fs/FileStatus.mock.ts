import { FileStatus } from "xray16";

/**
 * Mock engine FS status.
 */
export class MockFileStatus implements FileStatus {
  public static mock(exists?: boolean, external?: boolean): FileStatus {
    return new MockFileStatus(exists, external);
  }

  public readonly Exists: boolean;
  public readonly External: boolean;

  public constructor(exists?: boolean, external?: boolean) {
    this.Exists = exists ?? true;
    this.External = external ?? false;
  }
}

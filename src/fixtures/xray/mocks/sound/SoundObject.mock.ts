import { jest } from "@jest/globals";

/**
 * Mock generic engine sound object.
 */
export class MockSoundObject {
  public path: string;

  public constructor(path: string) {
    this.path = path;
  }

  public play_at_pos = jest.fn(() => {});
}

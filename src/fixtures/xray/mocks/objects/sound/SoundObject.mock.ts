import { jest } from "@jest/globals";

import { TDuration, TRate } from "@/engine/lib/types";

/**
 * Mock generic engine sound object.
 */
export class MockSoundObject {
  public path: string;
  public volume: TRate = 0;
  public soundLength: TDuration = 30;

  public isPlaying: boolean = false;

  public constructor(path: string) {
    this.path = path;
  }

  public play_at_pos = jest.fn(() => {});

  public play = jest.fn(() => {
    this.isPlaying = true;
  });

  public stop = jest.fn(() => {
    this.isPlaying = false;
  });

  public playing = jest.fn(() => {
    return this.isPlaying;
  });

  public length = jest.fn(() => this.soundLength);

  public attach_tail = jest.fn();
}

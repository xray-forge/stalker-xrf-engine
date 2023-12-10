import { jest } from "@jest/globals";

/**
 * Mock of particles handling objects.
 */
export class MockParticleObject {
  public name: string;
  public isPlaying: boolean = false;

  public constructor(name: string) {
    this.name = name;
  }

  public playing = jest.fn(() => this.isPlaying);

  public play = jest.fn(() => {
    this.isPlaying = true;
  });

  public play_at_pos = jest.fn(() => {
    this.isPlaying = true;
  });

  public load_path = jest.fn(() => {});

  public start_path = jest.fn(() => {});

  public stop = jest.fn(() => {
    this.isPlaying = false;
  });
}

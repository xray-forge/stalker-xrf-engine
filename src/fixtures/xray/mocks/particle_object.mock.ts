import { jest } from "@jest/globals";

/**
 * Mock of particles handling objects.
 */
export class MockParticleObject {
  public name: string;

  public constructor(name: string) {
    this.name = name;
  }

  public playing = jest.fn(() => true);
  public stop = jest.fn(() => {});
}

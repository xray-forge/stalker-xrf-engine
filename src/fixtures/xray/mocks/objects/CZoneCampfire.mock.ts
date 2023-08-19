import { jest } from "@jest/globals";
import type { CZoneCampfire } from "xray16";

/**
 * Mock campfire game object
 */
export class MockCZoneCampfire {
  public static mock(state: boolean): CZoneCampfire {
    return new MockCZoneCampfire(state) as unknown as CZoneCampfire;
  }

  public state: boolean;

  public constructor(state: boolean = false) {
    this.state = state;
  }

  public is_on = jest.fn((): boolean => {
    return this.state;
  });

  public turn_on = jest.fn((): void => {
    this.state = true;
  });

  public turn_off = jest.fn((): void => {
    this.state = false;
  });
}

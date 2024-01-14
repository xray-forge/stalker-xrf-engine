import { jest } from "@jest/globals";

import { HangingLamp } from "@/engine/lib/types";

/**
 * Hanging lamp object with mocked methods.
 */
export class MockHangingLamp {
  public static mock(): HangingLamp {
    return new MockHangingLamp() as unknown as HangingLamp;
  }

  public turn_on = jest.fn();

  public turn_off = jest.fn();
}

import { jest } from "@jest/globals";

import { Nillable, ProfileTimer, TDuration, TTimestamp } from "@/engine/lib/types";

/**
 * Mocking high-precision timer for debugging and profiling of functions.
 */
export class MockProfileTimer implements ProfileTimer {
  public timestamp: Nillable<TTimestamp> = null;
  public duration: Nillable<TDuration> = null;

  public readonly __name: string = "profile_timer";

  public start = jest.fn(() => (this.timestamp = Date.now()));
  public stop = jest.fn(() => {
    if (this.duration === null) {
      this.duration = Date.now() - (this.timestamp as TTimestamp);
    }
  });

  public time = jest.fn(() => this.duration as number);
}

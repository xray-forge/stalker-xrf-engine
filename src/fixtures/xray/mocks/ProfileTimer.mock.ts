import { jest } from "@jest/globals";

import { Optional, TDuration, TTimestamp } from "@/engine/lib/types";

/**
 * Mocking high-precision timer for debugging and profiling of functions.
 */
export class MockProfileTimer {
  public timestamp: Optional<TTimestamp> = null;
  public duration: Optional<TDuration> = null;

  public start = jest.fn(() => (this.timestamp = Date.now()));
  public stop = jest.fn(() => {
    if (this.duration === null) {
      this.duration = Date.now() - (this.timestamp as TTimestamp);
    }
  });

  public time = jest.fn(() => this.duration);
}

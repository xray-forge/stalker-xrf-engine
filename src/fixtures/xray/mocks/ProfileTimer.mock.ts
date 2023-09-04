import { jest } from "@jest/globals";

/**
 * Mocking high-precision timer for debugging and profiling of functions.
 */
export class MockProfileTimer {
  public start = jest.fn(() => {});
}

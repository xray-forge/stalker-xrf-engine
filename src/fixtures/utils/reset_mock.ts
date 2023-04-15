import { jest } from "@jest/globals";

import { AnyCallable } from "@/engine/lib/types";

/**
 * Reset hidden mock functions.
 */
export function resetFunctionMock(callable: AnyCallable): void {
  const mocked: jest.MockedFunction<AnyCallable> = callable as jest.MockedFunction<AnyCallable>;

  if (mocked.mockReset) {
    mocked.mockReset();
  } else {
    throw new Error("Possibly not mocked function provided for mock reset.");
  }
}

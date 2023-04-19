import { jest } from "@jest/globals";

import { AnyCallable } from "@/engine/lib/types";

/**
 * Reset hidden mock functions.
 */
export function resetFunctionMock(callable: AnyCallable): void {
  if (jest.isMockFunction(callable)) {
    callable.mockReset();
  } else {
    throw new Error("Possibly not mocked function provided for mock reset.");
  }
}

/**
 * Replace mock function.
 */
export function replaceFunctionMock(callable: AnyCallable, newImplementation: AnyCallable): void {
  if (jest.isMockFunction(callable)) {
    callable.mockImplementation(newImplementation);
  } else {
    throw new Error("Possibly not mocked function provided for mock reset.");
  }
}

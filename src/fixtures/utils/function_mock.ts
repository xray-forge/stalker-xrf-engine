import { expect, jest } from "@jest/globals";

import { AnyCallable, AnyObject } from "@/engine/lib/types";

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

/**
 * Check mock function calls.
 */
export function expectCallsToEqual(callable: AnyCallable, calls: Array<Array<unknown>>): void {
  if (jest.isMockFunction(callable)) {
    expect(callable.mock.calls).toEqual(calls);
  } else {
    throw new Error("Possibly not mocked function provided for mock check.");
  }
}

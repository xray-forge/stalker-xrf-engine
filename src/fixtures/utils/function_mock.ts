import { expect, jest } from "@jest/globals";
import { Mock } from "jest-mock";

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
 * Reset hidden mock functions.
 */
export function getFunctionMock(callable: AnyCallable): Mock {
  if (jest.isMockFunction(callable)) {
    return callable;
  } else {
    throw new Error("Possibly not mocked function provided for mock reset.");
  }
}

/**
 * Replace mock function.
 * Assuming provided mock is jest mock.
 *
 * @param callable - any callable to replace
 * @param newImplementation - new variant of implementation
 */
export function replaceFunctionMock(callable: AnyCallable, newImplementation: AnyCallable): void {
  if (jest.isMockFunction(callable)) {
    callable.mockImplementation(newImplementation);
  } else {
    throw new Error("Possibly not mocked function provided for mock reset.");
  }
}

/**
 * Replace mock function once.
 * Assuming provided mock is jest mock.
 *
 * @param callable - any callable to replace
 * @param newImplementation - new variant of implementation
 */
export function replaceFunctionMockOnce(callable: AnyCallable, newImplementation: AnyCallable): void {
  if (jest.isMockFunction(callable)) {
    callable.mockImplementationOnce(newImplementation);
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

import { describe, expect, it, jest } from "@jest/globals";

import {
  expectCallsToEqual,
  getFunctionMock,
  replaceFunctionMock,
  replaceFunctionMockOnce,
  resetFunctionMock,
} from "@/fixtures/jest";

describe("resetFunctionMock util", () => {
  it("should correctly initialize", () => {
    const callback = jest.fn();

    callback(123);
    callback(456);

    expect(callback.mock.calls).toEqual([[123], [456]]);

    resetFunctionMock(callback);

    expect(callback.mock.calls).toEqual([]);
  });

  it("should throw if not mock provided", () => {
    expect(() => resetFunctionMock(() => {})).toThrow("Possibly not mocked function provided for mock reset.");
  });
});

describe("getFunctionMock util", () => {
  it("should correctly assert type and verify if function is mock", () => {
    const callback = jest.fn();

    expect(getFunctionMock(callback)).toBe(callback);
  });

  it("should throw if not mock provided", () => {
    expect(() => getFunctionMock(() => {})).toThrow("Possibly not mocked function provided for mock assertion.");
  });
});

describe("replaceFunctionMock util", () => {
  it("should correctly assert type and verify if function is mock", () => {
    const callback = jest.fn();

    expect(getFunctionMock(callback)).toBe(callback);
  });

  it("should throw if not mock provided", () => {
    expect(() => getFunctionMock(() => {})).toThrow("Possibly not mocked function provided for mock assertion.");
  });
});

describe("replaceFunctionMock util", () => {
  it("should correctly replace function implementation", () => {
    const callback = jest.fn();

    let counter: number = 0;

    callback();
    callback();

    expect(counter).toBe(0);

    replaceFunctionMock(callback, () => (counter += 1));

    callback();
    callback();
    callback();

    expect(counter).toBe(3);
  });

  it("should throw if not mock provided", () => {
    expect(() => {
      replaceFunctionMock(
        () => {},
        () => {}
      );
    }).toThrow("Possibly not mocked function provided for mock replace.");
  });
});

describe("replaceFunctionMockOnce util", () => {
  it("should correctly replace function implementation", () => {
    const callback = jest.fn();

    let counter: number = 0;

    callback();
    callback();

    expect(counter).toBe(0);

    replaceFunctionMockOnce(callback, () => (counter += 1));

    callback();
    callback();
    callback();

    expect(counter).toBe(1);
  });

  it("should throw if not mock provided", () => {
    expect(() => {
      replaceFunctionMockOnce(
        () => {},
        () => {}
      );
    }).toThrow("Possibly not mocked function provided for mock replace.");
  });
});

describe("expectCallsToEqual util", () => {
  it("should correctly check calls count with expected values", () => {
    const callback = jest.fn();

    callback(123);
    callback(456, 789);

    expectCallsToEqual(callback, [[123], [456, 789]]);
  });

  it("should throw if not mock provided", () => {
    expect(() => {
      expectCallsToEqual(() => {}, []);
    }).toThrow("Possibly not mocked function provided for mock check.");
  });
});

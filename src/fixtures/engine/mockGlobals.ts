import { jest } from "@jest/globals";

/**
 * todo;
 */
export function mockGlobals(): void {
  jest.mock("@/engine/scripts/utils/logging", () => ({
    LuaLogger: class {
      public error = jest.fn();
      public printStack = jest.fn();
    },
  }));

  // @ts-ignore
  global.$filename = "JEST_TEST";

  // @ts-ignore
  global.$range = (start: number, end: number) => {
    const data: Array<number> = [];

    for (let it = start; it <= end; it++) {
      data.push(it);
    }

    return data;
  };
}

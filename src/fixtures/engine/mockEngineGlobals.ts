import { jest } from "@jest/globals";

import { MockLuaLogger } from "@/fixtures/engine/mocks/LuaLogger.mock";
import { mockTableUtils } from "@/fixtures/engine/mocks/table.mocks";

/**
 * todo;
 */
export function mockEngineGlobals(): void {
  jest.mock("@/engine/core/utils/logging", () => ({
    LuaLogger: MockLuaLogger,
  }));

  jest.mock("@/engine/core/utils/table", () => mockTableUtils);

  // @ts-ignore
  global._G = global;

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

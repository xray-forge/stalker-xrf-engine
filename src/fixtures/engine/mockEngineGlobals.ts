import { jest } from "@jest/globals";

import { mockLfs } from "@/fixtures/engine/mocks/lfs.mock";
import { MockLuaLogger } from "@/fixtures/engine/mocks/LuaLogger.mock";
import { mockMarshal } from "@/fixtures/engine/mocks/marshal.mock";
import { mockTableUtils } from "@/fixtures/engine/mocks/table.mock";

/**
 * todo;
 */
export function mockEngineGlobals(): void {
  jest.mock("@/engine/core/utils/logging", () => ({
    LuaLogger: MockLuaLogger,
  }));

  jest.mock("@/engine/core/utils/table", () => mockTableUtils);

  // @ts-ignore
  global.marshal = mockMarshal;

  // @ts-ignore
  global.lfs = mockLfs;
}

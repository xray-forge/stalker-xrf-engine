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
}

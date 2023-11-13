import { jest } from "@jest/globals";

import { mockLfs } from "@/fixtures/engine/mocks/lfs.mock";
import { MockLuaLogger } from "@/fixtures/engine/mocks/LuaLogger.mock";
import { mockMarshal } from "@/fixtures/engine/mocks/marshal.mock";
import { mockTableUtils } from "@/fixtures/engine/mocks/table.mock";

/**
 * Mock global functions for XRF engine that should be ignored / replaced when executing tests.
 */
export function mockEngineGlobals(): void {
  // Simplify logger logics.
  jest.mock("@/engine/core/utils/logging/LuaLogger", () => ({
    LuaLogger: MockLuaLogger,
  }));

  // Handle tables differently in typescript.
  jest.mock("@/engine/core/utils/table", () => mockTableUtils);

  // @ts-ignore injection of marshal mocks
  global.marshal = mockMarshal;

  // @ts-ignore injection of lfs mocks
  global.lfs = mockLfs;
}

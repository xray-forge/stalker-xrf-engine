import { jest } from "@jest/globals";
import { AnyArgs, AnyCallable, AnyObject } from "xray16/lib";
import { MockFileSystem, MockIniFile, MockPatrol } from "xray16/mocks";

import { GAME_DATA_LTX_CONFIGS_DIR } from "#/globals";

import { roots } from "@/engine/constants/roots";
import { INI_FILES_MOCKS } from "@/fixtures/engine/mocks/ini_files.mock";
import { MockLuaLogger } from "@/fixtures/engine/mocks/LuaLogger.mock";
import { patrols } from "@/fixtures/engine/mocks/patrols.mock";
import { mockTableUtils } from "@/fixtures/engine/mocks/table.mock";

/**
 * Stand in for Lua's `pcall`, bridging until the `xray16` build in `node_modules` carries its own.
 *
 * @param callable - Function to call protected.
 * @param args - Arguments forwarded to the callable.
 * @returns Whether the call completed, paired with its result or the error message.
 */
function mockPcall(callable: AnyCallable, ...args: AnyArgs): [boolean, unknown] {
  try {
    return [true, callable(...args)];
  } catch (error) {
    return [false, error instanceof Error ? error.message : error];
  }
}

/**
 * Mock global functions for XRF engine that should be ignored / replaced when executing tests.
 */
export function mockXRFGlobals(): void {
  // todo: Now in `xray16/testing` `setupLuaGlobals` too. `node_modules/xray16` is an installed copy rather
  // than a link, so this stays until a build carrying it is pulled in - then drop this and `mockPcall`.
  (globalThis as AnyObject).pcall = mockPcall;

  // Simplify logger logics.
  jest.mock("@/engine/core/utils/logging/LuaLogger", () => ({
    LuaLogger: MockLuaLogger,
  }));

  // Handle tables differently in typescript.
  jest.mock("@/engine/core/utils/table", () => mockTableUtils);

  MockIniFile.setup({ configsDir: GAME_DATA_LTX_CONFIGS_DIR, files: INI_FILES_MOCKS });

  MockPatrol.setup(patrols);

  MockFileSystem.getInstance().setMockRoot(roots.gameSounds);
}

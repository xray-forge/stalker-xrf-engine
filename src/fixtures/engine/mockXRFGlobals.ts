import { jest } from "@jest/globals";
import { MockFileSystem, MockIniFile, MockPatrol } from "xray16/mocks";

import { GAME_DATA_LTX_CONFIGS_DIR } from "#/globals";

import { roots } from "@/engine/lib/constants/roots";
import { INI_FILES_MOCKS } from "@/fixtures/engine/mocks/ini_files.mock";
import { MockLuaLogger } from "@/fixtures/engine/mocks/LuaLogger.mock";
import { patrols } from "@/fixtures/engine/mocks/patrols.mock";
import { mockTableUtils } from "@/fixtures/engine/mocks/table.mock";

/**
 * Mock global functions for XRF engine that should be ignored / replaced when executing tests.
 */
export function mockXRFGlobals(): void {
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

import { MockIniFile } from "xray16/mocks";

import { GAME_DATA_LTX_CONFIGS_DIR } from "#/globals";

import { INI_FILES_MOCKS } from "@/fixtures/xray/mocks/ini_files.mock";

/**
 * Configure the package `MockIniFile` for the engine test environment: point it at the real ltx configs
 * directory and inject the engine's `FILES_MOCKS` registry (by reference, so per-test mutations are seen).
 * Runs at jest setup (per test file).
 */
export function mockIniFiles(): void {
  MockIniFile.setup({ configsDir: GAME_DATA_LTX_CONFIGS_DIR, files: INI_FILES_MOCKS });
}

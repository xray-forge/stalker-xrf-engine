import { MockIniFile, MockPatrol } from "xray16/mocks";

import { GAME_DATA_LTX_CONFIGS_DIR } from "#/globals";

import { patrols } from "@/fixtures/xray/mocks";
import { INI_FILES_MOCKS } from "@/fixtures/xray/mocks/ini_files.mock";

/**
 * Configure the package ini files and patrols.
 */
export function mockXRayRuntime(): void {
  MockIniFile.setup({ configsDir: GAME_DATA_LTX_CONFIGS_DIR, files: INI_FILES_MOCKS });
  MockPatrol.setup(patrols);
}

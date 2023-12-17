import { describe, expect, it } from "@jest/globals";

import {
  DUMMY_LTX,
  DYNAMIC_LTX_PREFIX,
  DYNAMIC_WEATHER_GRAPHS,
  GAME_LTX,
  SMART_TERRAIN_MASKS_LTX,
  SOUND_STORIES_LTX,
  SQUAD_BEHAVIOURS_LTX,
  SYSTEM_INI,
} from "@/engine/core/database/ini_registry";
import { IniFile } from "@/engine/lib/types";
import { MockIniFile } from "@/fixtures/xray";

describe("ini_registry database module", () => {
  it("should have correct prefix for RAM ini files", () => {
    expect(DYNAMIC_LTX_PREFIX).toBe("*");
  });

  it("should correctly define ini files globals", () => {
    const expectedIniFiles: Array<IniFile> = [
      SYSTEM_INI,
      DUMMY_LTX,
      GAME_LTX,
      DYNAMIC_WEATHER_GRAPHS,
      SQUAD_BEHAVIOURS_LTX,
      SMART_TERRAIN_MASKS_LTX,
      SOUND_STORIES_LTX,
    ];

    expectedIniFiles.forEach((it) => expect(it instanceof MockIniFile).toBeTruthy());
  });
});

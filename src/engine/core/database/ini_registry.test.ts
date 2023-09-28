import { describe, expect, it } from "@jest/globals";

import {
  DEATH_GENERIC_LTX,
  DIALOG_MANAGER_LTX,
  DUMMY_LTX,
  DYNAMIC_LTX_PREFIX,
  DYNAMIC_WEATHER_GRAPHS,
  GAME_LTX,
  ITEM_UPGRADES,
  PH_BOX_GENERIC_LTX,
  SCRIPT_SOUND_LTX,
  SIMULATION_LTX,
  SIMULATION_OBJECTS_PROPS_LTX,
  SMART_TERRAIN_MASKS_LTX,
  SOUND_STORIES_LTX,
  SQUAD_BEHAVIOURS_LTX,
  STALKER_UPGRADE_INFO,
  SYSTEM_INI,
  TASK_MANAGER_LTX,
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
      SIMULATION_LTX,
      DIALOG_MANAGER_LTX,
      SCRIPT_SOUND_LTX,
      PH_BOX_GENERIC_LTX,
      DYNAMIC_WEATHER_GRAPHS,
      DEATH_GENERIC_LTX,
      ITEM_UPGRADES,
      STALKER_UPGRADE_INFO,
      SQUAD_BEHAVIOURS_LTX,
      SMART_TERRAIN_MASKS_LTX,
      TASK_MANAGER_LTX,
      SIMULATION_OBJECTS_PROPS_LTX,
      SOUND_STORIES_LTX,
    ];

    expectedIniFiles.forEach((it) => expect(it instanceof MockIniFile).toBeTruthy());
  });
});

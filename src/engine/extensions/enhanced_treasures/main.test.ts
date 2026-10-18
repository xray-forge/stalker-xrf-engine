import { beforeEach, describe, expect, it } from "@jest/globals";

import { mapMarks } from "@/engine/constants/map_marks";
import { EGameHook, EGameHookPhase, getGameHookRegistrations } from "@/engine/core/hooks";
import { getTreasureMapSpot } from "@/engine/core/managers/map/utils/map_spot_treasure";
import { treasureConfig } from "@/engine/core/managers/treasures";
import { ETreasureType, ITreasureDescriptor } from "@/engine/core/managers/treasures/treasures_types";
import { getEnhancedTreasureMapSpot, name, register } from "@/engine/extensions/enhanced_treasures/main";
import { resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
});

describe("enhanced treasures", () => {
  it("should show treasures with the spot of their type through the hook, leaving the core config alone", () => {
    const treasure: ITreasureDescriptor = { type: ETreasureType.EPIC } as ITreasureDescriptor;

    expect(getTreasureMapSpot(treasure)).toBe(mapMarks.treasure);

    register();

    expect(treasureConfig.ENHANCED_MODE_ENABLED).toBe(false);
    expect(getGameHookRegistrations(EGameHook.TREASURE_MAP_SPOT)).toEqualLuaArrays([
      { handler: getEnhancedTreasureMapSpot, context: false, owner: name, phase: EGameHookPhase.SET },
    ]);
    expect(getTreasureMapSpot(treasure)).toBe(mapMarks.treasure_epic);
  });
});

import { GameObject } from "xray16/alias";
import { extern, Nillable, TName, TNumberId, TStringId } from "xray16/lib";

import { getManager, getObjectIdByStoryId } from "@/engine/core/database";
import { getSimulationTerrainByName } from "@/engine/core/managers/simulation/utils";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";

/**
 * Play sound in smart terrain by object story ID.
 *
 * Where:
 * - storyId - story ID of object to play sound for
 * - theme - name of sound theme to play
 * - faction - name of faction prefix for sound theme
 * - terrainNameOrId - name or identifier of smart terrain to play in.
 *
 * Todo: Is it used with smart terrain ID at all?
 */
extern(
  "xr_effects.play_sound_by_story",
  (
    _: GameObject,
    __: GameObject,
    [storyId, theme, faction, terrainNameOrId]: [TStringId, TName, TName, TName | TNumberId]
  ): void => {
    const terrain: Nillable<SmartTerrain> = getSimulationTerrainByName(terrainNameOrId as TName);
    const terrainId: TNumberId = terrain ? terrain.id : (terrainNameOrId as TNumberId);

    getManager(SoundManager).play(getObjectIdByStoryId(storyId) as TNumberId, theme, faction, terrainId);
  }
);

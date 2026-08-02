import { GameObject, ServerObject } from "xray16/alias";
import { abort, extern, LuaArray, Nillable, TDistance, TIndex, TNumberId, TStringId } from "xray16/lib";
import { $fromArray } from "xray16/macros";

import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { getObjectIdByStoryId, registry } from "@/engine/core/database";
import { giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { spawnSquadInSmart } from "@/engine/core/utils/spawn";

/**
 * Determine the farthest Pripyat a28 monolith zone, give its wave info portion and spawn the matching squad.
 */
extern("xr_effects.pri_a28_check_zones", (): void => {
  const actor: GameObject = registry.actor;
  let dist: TDistance = 0;
  let index: TIndex = 0;

  const zonesList: LuaArray<TStringId> = $fromArray([
    "pri_a28_sr_mono_add_1",
    "pri_a28_sr_mono_add_2",
    "pri_a28_sr_mono_add_3",
  ]);

  const infoList: LuaArray<TInfoPortion> = $fromArray<TInfoPortion>([
    infoPortions.pri_a28_wave_1_spawned,
    infoPortions.pri_a28_wave_2_spawned,
    infoPortions.pri_a28_wave_3_spawned,
  ]);

  const squadsList: LuaArray<TStringId> = $fromArray([
    "pri_a28_heli_mono_add_1",
    "pri_a28_heli_mono_add_2",
    "pri_a28_heli_mono_add_3",
  ]);

  for (const [itIndex, it] of zonesList) {
    const storyObjectId: Nillable<TNumberId> = getObjectIdByStoryId(it);

    if (storyObjectId) {
      const serverObject: Nillable<ServerObject> = registry.simulator.object(storyObjectId)!;
      const distance: TDistance = serverObject.position.distance_to(actor.position());

      if (index === 0) {
        dist = distance;
        index = itIndex;
      } else if (dist < distance) {
        dist = distance;
        index = itIndex;
      }
    }
  }

  if (index === 0) {
    abort("Found no distance || zones in func 'pri_a28_check_zones'");
  }

  if (hasInfoPortion(infoList.get(index))) {
    for (const [k] of infoList) {
      if (!hasInfoPortion(infoList.get(k))) {
        giveInfoPortion(infoList.get(k));
      }
    }
  } else {
    giveInfoPortion(infoList.get(index));
  }

  spawnSquadInSmart(squadsList.get(index), "pri_a28_heli");
});

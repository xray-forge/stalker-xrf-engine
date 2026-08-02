import { GameObject, ServerCreatureObject } from "xray16/alias";
import { extern, isObjectInZone, LuaArray, TName } from "xray16/lib";
import { $fromArray } from "xray16/macros";

import { registry } from "@/engine/core/database";

/**
 * Check the precondition for the `zat_b29` rivals dialog: the object squad is a known rival squad inside a target zone.
 *
 * @param actor - Actor game object, not used directly.
 * @param object - Game object whose squad and current zone are checked.
 * @returns Whether the object belongs to a rival squad and is located inside one of the target zones.
 */
extern("xr_conditions.zat_b29_rivals_dialog_precond", (actor: GameObject, object: GameObject): boolean => {
  const squadsList: LuaArray<TName> = $fromArray<TName>([
    "zat_b29_stalker_rival_default_1_squad",
    "zat_b29_stalker_rival_default_2_squad",
    "zat_b29_stalker_rival_1_squad",
    "zat_b29_stalker_rival_2_squad",
  ]);
  const zonesList: LuaArray<TName> = $fromArray([
    "zat_b29_sr_1",
    "zat_b29_sr_2",
    "zat_b29_sr_3",
    "zat_b29_sr_4",
    "zat_b29_sr_5",
  ]);

  let isSquad: boolean = false;

  for (const [, v] of squadsList) {
    if (
      registry.simulator
        .object(registry.simulator.object<ServerCreatureObject>(object.id())!.group_id)!
        .section_name() === v
    ) {
      isSquad = true;
      break;
    }
  }

  if (!isSquad) {
    return false;
  }

  for (const [k, v] of zonesList) {
    if (isObjectInZone(object, registry.zones.get(v))) {
      return true;
    }
  }

  return false;
});

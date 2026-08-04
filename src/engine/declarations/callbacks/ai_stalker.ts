import { ServerObject } from "xray16/alias";
import { extern, TNumberId } from "xray16/lib";

import { selectBestStalkerWeapon } from "@/engine/core/ai/combat";
import { getManager } from "@/engine/core/database";
import { LoadoutManager } from "@/engine/core/managers/loadout";

/** AI stalker callbacks. */
extern("ai_stalker", {
  update_best_weapon: selectBestStalkerWeapon,
  CSE_ALifeObject_spawn_supplies: (object: ServerObject, id: TNumberId, iniData: string): boolean =>
    getManager(LoadoutManager).onGenerateServerObjectLoadout(object, id, iniData),
});

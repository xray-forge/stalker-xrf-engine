import { IRegistryObjectState, registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { ISchemeCorpseDetectionState } from "@/engine/core/schemes/corpse_detection";
import { transferLoot } from "@/engine/core/utils/object/object_loot";
import { chance } from "@/engine/core/utils/random";
import { scriptSounds } from "@/engine/lib/constants/sound/script_sounds";
import { ClientObject, EScheme, LuaArray, Optional, TNumberId } from "@/engine/lib/types";

/**
 * Finish loot corpse action - transfer all the items from corpse and play sound notification about loot quality.
 *
 * @param object - target object to finish looting of corpse
 */
export function finishCorpseLooting(object: ClientObject): void {
  const state: IRegistryObjectState = registry.objects.get(object.id());
  const corpseObjectId: Optional<TNumberId> = (state[EScheme.CORPSE_DETECTION] as ISchemeCorpseDetectionState)
    .selectedCorpseId;
  const corpseObject: Optional<ClientObject> = corpseObjectId ? registry.objects.get(corpseObjectId)?.object : null;

  // If corpse exists online:
  if (corpseObject) {
    const transferred: LuaArray<ClientObject> = transferLoot(corpseObject, object);

    // Tell about loot quality with random chance, probably some price based assumption should work better.
    // Still tell about bad loot if transferred list is empty (actor took everything).
    GlobalSoundManager.getInstance().playSound(
      object.id(),
      transferred.length() > 0 && chance(80) ? scriptSounds.corpse_loot_good : scriptSounds.corpse_loot_bad
    );
  }
}

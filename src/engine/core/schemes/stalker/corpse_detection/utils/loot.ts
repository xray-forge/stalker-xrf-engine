import { getManager, IRegistryObjectState, registry, setPortableStoreValue } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import {
  ISchemeCorpseDetectionState,
  PS_LOOTING_DEAD_OBJECT,
} from "@/engine/core/schemes/stalker/corpse_detection/corpse_detection_types";
import { transferLoot } from "@/engine/core/utils/loot";
import { chance } from "@/engine/core/utils/random";
import { EScheme, GameObject, LuaArray, Optional, TNumberId } from "@/engine/lib/types";

/**
 * Finish loot corpse action - transfer all the items from corpse and play sound notification about loot quality.
 *
 * @param object - target object to finish looting of corpse
 */
export function finishCorpseLooting(object: GameObject): void {
  const state: IRegistryObjectState = registry.objects.get(object.id());
  const corpseObjectId: Optional<TNumberId> = (state[EScheme.CORPSE_DETECTION] as ISchemeCorpseDetectionState)
    .selectedCorpseId;
  const corpseObject: Optional<GameObject> = corpseObjectId ? registry.objects.get(corpseObjectId)?.object : null;

  // If corpse exists online:
  if (corpseObject) {
    const transferred: LuaArray<GameObject> = transferLoot(corpseObject, object);

    // Tell about loot quality with random chance, probably some price based assumption should work better.
    // Still tell about bad loot if transferred list is empty (actor took everything).
    getManager(SoundManager).play(
      object.id(),
      transferred.length() > 0 && chance(80) ? "corpse_loot_good" : "corpse_loot_bad"
    );
  }
}

/**
 * Free currently looted object corpse from being looted status lock.
 *
 * @param lootedObjectId - id of target game object being looted
 */
export function freeSelectedLootedObjectSpot(lootedObjectId: TNumberId): void {
  const lootedObjectState: Optional<IRegistryObjectState> = registry.objects.get(
    lootedObjectId
  ) as Optional<IRegistryObjectState>;

  if (lootedObjectState) {
    setPortableStoreValue(lootedObjectId, PS_LOOTING_DEAD_OBJECT, null);
  }
}

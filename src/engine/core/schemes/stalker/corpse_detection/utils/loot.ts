import { IRegistryObjectState, registry, setPortableStoreValue } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { ISchemeCorpseDetectionState } from "@/engine/core/schemes/stalker/corpse_detection";
import { LuaLogger } from "@/engine/core/utils/logging";
import { transferLoot } from "@/engine/core/utils/loot";
import { chance } from "@/engine/core/utils/random";
import { LOOTING_DEAD_OBJECT_KEY } from "@/engine/lib/constants/portable_store_keys";
import { ClientObject, EScheme, LuaArray, Optional, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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
      transferred.length() > 0 && chance(80) ? "corpse_loot_good" : "corpse_loot_bad"
    );
  }
}

/**
 * todo;
 */
export function freeSelectedLootedObjectSpot(lootedObject: TNumberId): void {
  const lootedObjectState: Optional<IRegistryObjectState> = registry.objects.get(lootedObject);

  if (lootedObjectState !== null) {
    setPortableStoreValue(lootedObject, LOOTING_DEAD_OBJECT_KEY, null);
  }
}

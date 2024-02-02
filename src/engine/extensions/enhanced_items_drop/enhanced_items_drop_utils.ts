import { isObjectTrader } from "@/engine/core/managers/trade/utils";
import { addRandomUpgrades } from "@/engine/core/managers/upgrades";
import { getItemOwnerId } from "@/engine/core/utils/item";
import { enhancedDropConfig } from "@/engine/extensions/enhanced_items_drop/EnhancedDropConfig";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { GameObject, Optional, TCount, TNumberId, TRate } from "@/engine/lib/types";

/**
 * Handle item going online (spawning) first time.
 *
 * @param object - game object of item switching online
 */
export function onItemGoOnlineFirstTime(object: GameObject): void {
  const ownerId: Optional<TNumberId> = getItemOwnerId(object.id());

  // Do not upgrade actor spawned items.
  if (ownerId === ACTOR_ID) {
    return;
  }

  let chance: TRate = math.random(100);
  const dispersion: TCount = enhancedDropConfig.ADD_RANDOM_DISPERSION * math.random();

  // Apply different rate for trader / owned / world.
  if (ownerId && isObjectTrader(ownerId)) {
    chance /= enhancedDropConfig.ADD_RANDOM_RATE_TRADER;
  } else if (ownerId) {
    chance /= enhancedDropConfig.ADD_RANDOM_RATE_OWNED;
  } else {
    chance /= enhancedDropConfig.ADD_RANDOM_RATE_WORLD;
  }

  if (chance <= enhancedDropConfig.ADD_RANDOM_LEGENDARY_CHANCE) {
    return addRandomUpgrades(object, enhancedDropConfig.ADD_RANDOM_LEGENDARY_COUNT + dispersion);
  } else if (chance <= enhancedDropConfig.ADD_RANDOM_EPIC_CHANCE) {
    return addRandomUpgrades(object, enhancedDropConfig.ADD_RANDOM_EPIC_COUNT + dispersion);
  } else if (chance <= enhancedDropConfig.ADD_RANDOM_RARE_CHANCE) {
    return addRandomUpgrades(object, enhancedDropConfig.ADD_RANDOM_RARE_COUNT + dispersion);
  } else if (chance <= enhancedDropConfig.ADD_RANDOM_CHANCE) {
    return addRandomUpgrades(object, enhancedDropConfig.ADD_RANDOM_COUNT + dispersion);
  }
}

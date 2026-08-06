import { GameObject } from "xray16/alias";
import { ACTOR_ID, Nillable, TCount, TNumberId, TRate } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { registry } from "@/engine/core/database";
import { isObjectTrader } from "@/engine/core/managers/trade/utils";
import { addRandomUpgrades } from "@/engine/core/managers/upgrades";
import { getItemOwnerId } from "@/engine/core/utils/item";
import { enhancedDropConfig } from "@/engine/extensions/enhanced_items_drop/EnhancedDropConfig";

/**
 * Handle item going online (spawning) first time.
 *
 * @param object - Game object of item switching online.
 */
export function onItemWeaponGoOnlineFirstTime(object: GameObject): void {
  const ownerId: Nillable<TNumberId> = getItemOwnerId(object.id());

  // Only upgrade weapons currently owned by non-trader human NPCs.
  if (ownerId === ACTOR_ID || $isNil(ownerId) || $isNil(registry.stalkers.get(ownerId)) || isObjectTrader(ownerId)) {
    return;
  }

  const chance: TRate = math.random(100);
  const dispersion: TCount = enhancedDropConfig.ADD_RANDOM_DISPERSION * math.random();

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

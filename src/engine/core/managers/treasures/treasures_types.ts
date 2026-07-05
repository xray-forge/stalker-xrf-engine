import { $fromObject } from "xray16/macros";

import { TConditionList } from "@/engine/core/utils/ini";
import { LuaArray, Nillable, TCount, TNumberId, TProbability, TSection } from "@/engine/lib/types";

/**
 * Descriptor of a group of items contained in a treasure, including their count and spawn probability.
 */
export interface ITreasureItemsDescriptor {
  count: TCount;
  probability: TProbability;
  // Linked objects to the secret.
  itemsIds: Nillable<LuaArray<TNumberId>>;
}

/**
 * Descriptor of a treasure (secret), including its state, type, refresh conditions and contained items.
 */
export interface ITreasureDescriptor {
  given: boolean;
  checked: boolean;
  type: ETreasureType;
  // Condlist to check if secret can be refreshed.
  refreshing: Nillable<TConditionList>;
  empty: Nillable<TConditionList>;
  itemsToFindRemain: TCount;
  items: LuaTable<TSection, LuaArray<ITreasureItemsDescriptor>>;
}

/**
 * Enumeration with possible treasure type.
 */
export const enum ETreasureType {
  COMMON = "common",
  EPIC = "epic",
  RARE = "rare",
  UNIQUE = "unique",
}

/**
 * Allowed types for treasures.
 */
export const ALLOWED_TREASURE_TYPES: LuaTable<ETreasureType, boolean> = $fromObject({
  [ETreasureType.COMMON]: true,
  [ETreasureType.EPIC]: true,
  [ETreasureType.RARE]: true,
  [ETreasureType.UNIQUE]: true,
});

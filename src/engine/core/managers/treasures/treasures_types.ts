import { TConditionList } from "@/engine/core/utils/ini";
import { LuaArray, Optional, TCount, TNumberId, TProbability, TSection } from "@/engine/lib/types";

/**
 * Descriptor of a group of items contained in a treasure, including their count and spawn probability.
 */
export interface ITreasureItemsDescriptor {
  count: TCount;
  probability: TProbability;
  // Linked objects to the secret.
  itemsIds: Optional<LuaArray<TNumberId>>;
}

/**
 * Descriptor of a treasure (secret), including its state, type, refresh conditions and contained items.
 */
export interface ITreasureDescriptor {
  given: boolean;
  checked: boolean;
  type: ETreasureType;
  // Condlist to check if secret can be refreshed.
  refreshing: Optional<TConditionList>;
  empty: Optional<TConditionList>;
  itemsToFindRemain: TCount;
  items: LuaTable<TSection, LuaArray<ITreasureItemsDescriptor>>;
}

/**
 * Enumeration with possible treasure type.
 */
export enum ETreasureType {
  COMMON = "common",
  EPIC = "epic",
  RARE = "rare",
  UNIQUE = "unique",
}

/**
 * Allowed types for treasures.
 */
export const ALLOWED_TREASURE_TYPES: LuaTable<ETreasureType, boolean> = $fromObject(
  Object.values(ETreasureType).reduce(
    (acc, it) => {
      acc[it] = true;

      return acc;
    },
    {} as Record<ETreasureType, boolean>
  )
);

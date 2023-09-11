import { TConditionList } from "@/engine/core/utils/ini";
import { LuaArray, Optional, TCount, TNumberId, TProbability, TSection } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ITreasureItemsDescriptor {
  count: TCount;
  probability: TProbability;
  // Linked objects to the secret.
  itemsIds: Optional<LuaArray<TNumberId>>;
}

/**
 * todo;
 */
export interface ITreasureDescriptor {
  given: boolean;
  checked: boolean;
  cost: TCount;
  // Condlist to check if secret can be refreshed.
  refreshing: Optional<TConditionList>;
  empty: Optional<TConditionList>;
  itemsToFindRemain: TCount;
  items: LuaTable<TSection, LuaArray<ITreasureItemsDescriptor>>;
}

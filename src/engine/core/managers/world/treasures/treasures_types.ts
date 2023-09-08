import { TConditionList } from "@/engine/core/utils/ini";
import { LuaArray, Optional, TCount, TNumberId, TProbability, TSection } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ITreasureItemsDescriptor {
  count: TCount;
  prob: TProbability;
  item_ids: Optional<LuaArray<TNumberId>>;
}

/**
 * todo;
 */
export interface ITreasureDescriptor {
  given: boolean;
  checked: boolean;
  refreshing: Optional<TConditionList>;
  empty: Optional<TConditionList>;
  itemsToFindRemain: TCount;
  items: LuaTable<TSection, LuaArray<ITreasureItemsDescriptor>>;
}

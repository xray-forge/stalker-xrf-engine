import { TCount, TName, TRate, TSection } from "@/engine/lib/types";

export const boxConfig = {
  LOOT_BOX_SECTIONS: $fromArray<TSection>([
    "def_box",
    "small_box_generic",
    "small_box_ussr",
    "small_box_nato",
    "small_box_army",
    "small_box_science",
    "big_box_generic",
    "big_box_dungeons",
    "big_box_arsenal",
  ]),
  ITEMS_BY_BOX_SECTION: new LuaTable<TSection, LuaTable<TSection, TCount>>(),
  DROP_RATE_BY_LEVEL: new LuaTable<TName, TRate>(),
  DROP_COUNT_BY_LEVEL: new LuaTable<TName, { min: TCount; max: TCount }>(),
};

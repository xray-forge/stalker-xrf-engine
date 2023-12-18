import { ini_file } from "xray16";

import { IniFile, TCount, TName, TRate, TSection } from "@/engine/lib/types";

export const BOX_METAL_01: TName = "dynamics\\box\\box_metall_01";
export const BOX_WOOD_01: TName = "dynamics\\box\\box_wood_01";
export const BOX_WOOD_02: TName = "dynamics\\box\\box_wood_02";

export const LOT_BOX_DEFAULT: TName = "def_box";
export const LOT_BOX_SMALL_GENERIC: TName = "small_box_generic";
export const LOT_BOX_SMALL_USSR: TName = "small_box_ussr";
export const LOT_BOX_SMALL_NATO: TName = "small_box_nato";
export const LOT_BOX_SMALL_ARMY: TName = "small_box_army";
export const LOT_BOX_SCIENCE: TName = "small_box_science";
export const LOT_BOX_BIG_GENERIC: TName = "big_box_generic";
export const LOT_BOX_BIG_DUNGEONS: TName = "big_box_dungeons";
export const LOT_BOX_BIG_ARSENAL: TName = "big_box_arsenal";

export const PH_BOX_GENERIC_LTX: IniFile = new ini_file("misc\\ph_box_generic.ltx");

/**
 * Configuration of drop boxes looting and drop items.
 */
export const boxConfig = {
  GENERIC_LOOT_BOX_DROP_CHANCE: 15,
  LOOT_BOX_SECTIONS: $fromArray<TSection>([
    LOT_BOX_DEFAULT,
    LOT_BOX_SMALL_GENERIC,
    LOT_BOX_SMALL_USSR,
    LOT_BOX_SMALL_NATO,
    LOT_BOX_SMALL_ARMY,
    LOT_BOX_SCIENCE,
    LOT_BOX_BIG_GENERIC,
    LOT_BOX_BIG_DUNGEONS,
    LOT_BOX_BIG_ARSENAL,
  ]),
  LOOT_BOX_VISUALS: $fromObject<TSection, boolean>({
    [BOX_METAL_01]: true,
    [BOX_WOOD_01]: true,
    [BOX_WOOD_02]: true,
  }),
  DROP_ITEMS_BY_SECTION: new LuaTable<TSection, LuaTable<TSection, TCount>>(),
  DROP_RATE_BY_LEVEL: new LuaTable<TName, TRate>(),
  DROP_COUNT_BY_LEVEL: new LuaTable<TName, { min: TCount; max: TCount }>(),
};

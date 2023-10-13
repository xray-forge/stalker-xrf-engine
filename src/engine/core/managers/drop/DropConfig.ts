import { ini_file } from "xray16";

import {
  readIniDropByCommunity,
  readIniDropCountByLevel,
  readIniDropDependentItems,
} from "@/engine/core/managers/drop/utils/drop_init";
import { readIniFieldsAsSet } from "@/engine/core/utils/ini";
import { IniFile } from "@/engine/lib/types";

export const DROP_MANAGER_CONFIG_LTX: IniFile = new ini_file("managers\\drop_manager.ltx");

export const dropConfig = {
  DONT_SPAWN_LOOT_LTX_SECTION: "dont_spawn_loot",
  // List of items by community that drop with specified probability.
  ITEMS_BY_COMMUNITY: readIniDropByCommunity(DROP_MANAGER_CONFIG_LTX),
  /**
   * Dependent items by section id.
   * Example: specific weapon always should drop ammo for it.
   */
  ITEMS_DEPENDENCIES: readIniDropDependentItems(DROP_MANAGER_CONFIG_LTX),
  ITEMS_DROP_COUNT_BY_LEVEL: readIniDropCountByLevel(DROP_MANAGER_CONFIG_LTX),
  ITEMS_KEEP: readIniFieldsAsSet(DROP_MANAGER_CONFIG_LTX, "keep_items"),
  DROPPED_WEAPON_STATE_DEGRADATION: {
    MIN: 40,
    MAX: 80,
  },
};

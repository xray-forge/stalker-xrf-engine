import { level, XR_game_object, XR_ini_file } from "xray16";

import { PH_BOX_GENERIC_LTX } from "@/engine/core/database";
import { abort } from "@/engine/core/utils/debug";
import { getConfigString } from "@/engine/core/utils/ini_config/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseNames, parseNumbers } from "@/engine/core/utils/parse";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { LuaArray, Optional, TCount, TProbability, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const item_by_community: LuaTable<string, LuaTable<TInventoryItem, TCount>> = new LuaTable();
const mul_by_level: LuaTable<string, number> = new LuaTable();
const count_by_level: LuaTable<string, { min: number; max: number }> = new LuaTable();

const community_list: LuaArray<string> = [
  "def_box",
  "small_box_generic",
  "small_box_ussr",
  "small_box_nato",
  "small_box_army",
  "small_box_science",
  "big_box_generic",
  "big_box_dungeons",
  "big_box_arsenal",
] as any;

/**
 * todo;
 */
export class PhysicObjectItemBox {
  public static readBoxItemList(
    spawn_ini: XR_ini_file,
    section: TSection,
    line: string,
    obj: XR_game_object
  ): Optional<LuaTable<string, { section: TInventoryItem; count: TCount }>> {
    if (spawn_ini.line_exist(section, line)) {
      const t: LuaArray<TInventoryItem> = parseNames(spawn_ini.r_string(section, line));
      const n: TCount = t.length();

      const ret_table: LuaTable<string, { section: TInventoryItem; count: TCount }> = new LuaTable();
      let k = 1;

      while (k <= n) {
        const item = {
          section: t.get(k),
          count: null as unknown as number,
        };

        if (item_by_community.get("def_box").get(item.section) === null) {
          logger.info("There is no such item [%s] for box [%s]", tostring(item.section), obj.name());
        }

        if (t.get(k + 1) !== null) {
          const p: Optional<number> = tonumber(t.get(k + 1)) as Optional<number>;

          if (p) {
            item.count = p;
            k = k + 2;
          } else {
            item.count = 1;
            k = k + 1;
          }
        } else {
          item.count = 1;
          k = k + 1;
        }

        table.insert(ret_table, item);
      }

      return ret_table;
    }

    return null;
  }

  public object: XR_game_object;

  public constructor(object: XR_game_object) {
    this.object = object;

    for (const [k, v] of pairs(community_list)) {
      item_by_community.set(v, new LuaTable());
      if (PH_BOX_GENERIC_LTX.section_exist(v)) {
        const n = PH_BOX_GENERIC_LTX.line_count(v);

        for (const i of $range(0, n - 1)) {
          const [result, id, value] = PH_BOX_GENERIC_LTX.r_line(v, i, "", "");

          item_by_community.get(v).set(id as TInventoryItem, 100 * tonumber(value)!);
        }
      }
    }

    let level_name: string = level.name();

    if (!PH_BOX_GENERIC_LTX.section_exist(level_name)) {
      level_name = "default";
    }

    for (const i of $range(0, PH_BOX_GENERIC_LTX.line_count(level_name) - 1)) {
      const [result, id, value] = PH_BOX_GENERIC_LTX.r_line(level_name, i, "", "");

      mul_by_level.set(id, tonumber(value)!);
    }

    const item_count_section = "item_count_" + level.get_game_difficulty();

    for (const i of $range(0, PH_BOX_GENERIC_LTX.line_count(item_count_section) - 1)) {
      const [result, id, value] = PH_BOX_GENERIC_LTX.r_line(item_count_section, i, "", "");

      const nums = parseNumbers(value);

      if (nums.get(1) === null) {
        abort("Error on [PH_BOX_GENERIC_LTX] declaration. Section [%s], line [%s]", item_count_section, tostring(id));
      }

      let min: number = nums.get(1);
      let max: number = nums.get(2);

      if (max === null) {
        max = min;
      }

      if (mul_by_level.get(id) === null) {
        mul_by_level.set(id, 0);
      }

      min = tonumber(min)! * mul_by_level.get(id);
      max = tonumber(max)! * mul_by_level.get(id);

      count_by_level.set(id, { min: min, max: max });
    }
  }

  public spawnBoxItems(): void {
    logger.info("Spawn items for:", this.object.name());

    const ini: XR_ini_file = this.object.spawn_ini();
    const currentBoxItems = PhysicObjectItemBox.readBoxItemList(ini, "drop_box", "items", this.object);

    if (currentBoxItems === null) {
      const community = getConfigString(ini, "drop_box", "community", this.object, false, "", "def_box");
      const boxItemsToSpawn: LuaTable<TInventoryItem, TProbability> =
        item_by_community.get(community) ?? item_by_community.get("def_box");

      for (const [section, probability] of boxItemsToSpawn) {
        const it = count_by_level.get(section);
        const count: TCount = math.ceil(math.random(it.min, it.max));

        spawnItemsForObject(this.object, section, count, probability);
      }
    } else {
      for (const [key, item] of currentBoxItems) {
        spawnItemsForObject(this.object, item.section, item.count);
      }
    }
  }
}

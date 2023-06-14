import { level } from "xray16";

import { PH_BOX_GENERIC_LTX } from "@/engine/core/database";
import { abort } from "@/engine/core/utils/assertion";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { parseNumbersList, parseStringsList } from "@/engine/core/utils/ini/parse";
import { LuaLogger } from "@/engine/core/utils/logging";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { ClientObject, IniFile, LuaArray, Optional, TCount, TName, TProbability, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const itemByCommunity: LuaTable<string, LuaTable<TInventoryItem, TCount>> = new LuaTable();
const mulByLevel: LuaTable<string, number> = new LuaTable();
const countByLevel: LuaTable<string, { min: number; max: number }> = new LuaTable();

const communityList: LuaArray<string> = $fromArray([
  "def_box",
  "small_box_generic",
  "small_box_ussr",
  "small_box_nato",
  "small_box_army",
  "small_box_science",
  "big_box_generic",
  "big_box_dungeons",
  "big_box_arsenal",
]);

/**
 * todo;
 */
export class PhysicObjectItemBox {
  public static readBoxItemList(
    spawnIni: IniFile,
    section: TSection,
    line: string,
    obj: ClientObject
  ): Optional<LuaTable<string, { section: TInventoryItem; count: TCount }>> {
    if (spawnIni.line_exist(section, line)) {
      const t: LuaArray<TInventoryItem> = parseStringsList(spawnIni.r_string(section, line));
      const n: TCount = t.length();

      const retTable: LuaTable<string, { section: TInventoryItem; count: TCount }> = new LuaTable();
      let k = 1;

      while (k <= n) {
        const item = {
          section: t.get(k),
          count: null as unknown as number,
        };

        if (itemByCommunity.get("def_box").get(item.section) === null) {
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

        table.insert(retTable, item);
      }

      return retTable;
    }

    return null;
  }

  public object: ClientObject;

  public constructor(object: ClientObject) {
    this.object = object;

    for (const [k, v] of pairs(communityList)) {
      itemByCommunity.set(v, new LuaTable());
      if (PH_BOX_GENERIC_LTX.section_exist(v)) {
        const n = PH_BOX_GENERIC_LTX.line_count(v);

        for (const i of $range(0, n - 1)) {
          const [result, id, value] = PH_BOX_GENERIC_LTX.r_line(v, i, "", "");

          itemByCommunity.get(v).set(id as TInventoryItem, 100 * tonumber(value)!);
        }
      }
    }

    let levelName: TName = level.name();

    if (!PH_BOX_GENERIC_LTX.section_exist(levelName)) {
      levelName = "default";
    }

    for (const i of $range(0, PH_BOX_GENERIC_LTX.line_count(levelName) - 1)) {
      const [result, id, value] = PH_BOX_GENERIC_LTX.r_line(levelName, i, "", "");

      mulByLevel.set(id, tonumber(value)!);
    }

    const itemCountSection: TSection = "item_count_" + level.get_game_difficulty();

    for (const i of $range(0, PH_BOX_GENERIC_LTX.line_count(itemCountSection) - 1)) {
      const [result, id, value] = PH_BOX_GENERIC_LTX.r_line(itemCountSection, i, "", "");

      const nums = parseNumbersList(value);

      if (nums.get(1) === null) {
        abort("Error on [PH_BOX_GENERIC_LTX] declaration. Section [%s], line [%s]", itemCountSection, tostring(id));
      }

      let min: number = nums.get(1);
      let max: number = nums.get(2);

      if (max === null) {
        max = min;
      }

      if (mulByLevel.get(id) === null) {
        mulByLevel.set(id, 0);
      }

      min = tonumber(min)! * mulByLevel.get(id);
      max = tonumber(max)! * mulByLevel.get(id);

      countByLevel.set(id, { min: min, max: max });
    }
  }

  public spawnBoxItems(): void {
    logger.info("Spawn items for:", this.object.name());

    const ini: IniFile = this.object.spawn_ini();
    const currentBoxItems = PhysicObjectItemBox.readBoxItemList(ini, "drop_box", "items", this.object);

    if (currentBoxItems === null) {
      const community = readIniString(ini, "drop_box", "community", false, "", "def_box");
      const boxItemsToSpawn: LuaTable<TInventoryItem, TProbability> =
        itemByCommunity.get(community) ?? itemByCommunity.get("def_box");

      for (const [section, probability] of boxItemsToSpawn) {
        const it = countByLevel.get(section);
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

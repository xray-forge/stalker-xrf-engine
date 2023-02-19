import { alife, ini_file, level, XR_EngineBinding, XR_game_object, XR_ini_file } from "xray16";

import { communities, TCommunity } from "@/mod/globals/communities";
import { ammo, TAmmoItem } from "@/mod/globals/items/ammo";
import { misc } from "@/mod/globals/items/misc";
import { TSection } from "@/mod/lib/types";
import { IStalker } from "@/mod/scripts/core/alife/Stalker";
import { registry } from "@/mod/scripts/core/db";
import { getCharacterCommunity, setItemCondition } from "@/mod/scripts/utils/alife";
import { spawnAmmoForObject, spawnItemsForObject } from "@/mod/scripts/utils/alife_spawn";
import { isExcludedFromLootDropItem } from "@/mod/scripts/utils/checkers/checkers";
import { isAmmoItem, isArtefact, isGrenade, isLootableItem, isWeapon } from "@/mod/scripts/utils/checkers/is";
import { parseNames, parseNums } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("DropManager");

const death_ini: XR_ini_file = new ini_file("misc\\death_generic.ltx");
const item_by_community: LuaTable<TCommunity, LuaTable<string, number>> = new LuaTable();
const item_dependence: LuaTable<string, LuaTable<string, boolean>> = new LuaTable();
const mul_by_level: LuaTable<string, number> = new LuaTable();
const count_by_level: LuaTable<string, { min: number; max: number }> = new LuaTable();
const always_keep_item: LuaTable<string, boolean> = new LuaTable();

export function initDropSettings(): void {
  logger.info("Init drop settings");

  logger.info("Init drop settings for communities");
  for (const [k, v] of communities as any as LuaTable<TCommunity, TCommunity>) {
    const communityDrop: LuaTable<string, number> = new LuaTable();

    item_by_community.set(v, communityDrop);

    if (death_ini.section_exist(v)) {
      const n = death_ini.line_count(v);
      let id = "",
        result = "",
        value = "";

      for (const i of $range(0, n - 1)) {
        [result, id, value] = death_ini.r_line(v, i, "", "");
        communityDrop.set(id, 100 * tonumber(value)!);
      }
    }
  }

  logger.info("Init drop settings for item_dependence");

  const dependence_count = death_ini.line_count("item_dependence");

  for (const i of $range(0, dependence_count - 1)) {
    const [result, id, value] = death_ini.r_line("item_dependence", i, "", "");
    const idDependencies: LuaTable<string, boolean> = new LuaTable();

    item_dependence.set(id, idDependencies);

    const vvv = parseNames(value);

    for (const [k, v] of vvv) {
      idDependencies.set(v, true);
    }
  }

  let level_name: string = level.name();

  level_name = death_ini.section_exist(level_name) ? level_name : "default";

  const level_drops = death_ini.line_count(level_name);

  logger.info("Init drop settings for level", level_name);

  for (const i of $range(0, level_drops - 1)) {
    const [result, id, value] = death_ini.r_line(level_name, i, "", "");

    mul_by_level.set(id, tonumber(value)!);
  }

  const item_count_section = "item_count_" + level.get_game_difficulty();
  const item_count_drops: number = death_ini.line_count(item_count_section);

  logger.info("Init drop settings for counts");

  for (const i of $range(0, item_count_drops - 1)) {
    const [result, id, value] = death_ini.r_line(item_count_section, i, "", "");
    const t = parseNums(value);

    if (t.get(1) === null) {
      abort("Error on [death_ini] declaration. Section [%s], line [%s]", item_count_section, tostring(id));
    }

    let min = t.get(1);
    let max = t.get(2) === null ? min : t.get(2);

    if (!mul_by_level.has(id)) {
      mul_by_level.set(id, 0);
    }

    min = tonumber(min)! * mul_by_level.get(id);
    max = tonumber(max)! * mul_by_level.get(id);

    count_by_level.set(id, { min, max });
  }

  const keep_count = death_ini.line_count("keep_items");

  for (const i of $range(0, keep_count - 1)) {
    const [result, id, value] = death_ini.r_line("keep_items", i, "", "");

    if (value === "true") {
      always_keep_item.set(id, true);
    }
  }

  logger.info("Initialized drop settings");
}

export interface IDropManager extends XR_EngineBinding {
  npc: XR_game_object;

  create_release_item(): void;
  keep_item(npc: XR_game_object, item: XR_game_object): void;
  create_items(npc: XR_game_object, section: string, count: number, probability: number): void;
  check_item_dependence(npc: XR_game_object, section: string): boolean;
}

export const DropManager: IDropManager = declare_xr_class("DropManager", null, {
  __init(npc: XR_game_object): void {
    logger.info("Init drop manager:", npc.name());
    this.npc = npc;
  },
  create_release_item(): void {
    const se_obj = alife().object<IStalker>(this.npc.id());

    if (se_obj === null || se_obj.death_droped === true) {
      return;
    }

    se_obj.death_droped = true;

    this.npc.iterate_inventory((npc, item) => this.keep_item(npc, item), this.npc);

    const ini = this.npc.spawn_ini();

    if (ini !== null && ini.section_exist("dont_spawn_loot")) {
      return;
    }

    const st = registry.objects.get(this.npc.id());
    const st_ini = st && st.ini;

    if (st_ini && st_ini.line_exist(st.section_logic!, "dont_spawn_loot")) {
      return;
    }

    const spawn_items = item_by_community.get(getCharacterCommunity(this.npc));

    if (spawn_items === null) {
      return;
    }

    for (const [section, probability] of spawn_items) {
      if (this.check_item_dependence(this.npc, section) === true) {
        if (!count_by_level.has(section)) {
          abort("Incorrect count settings in DropManager for object[%s]", section);
        }

        const limits = count_by_level.get(section);
        const count = math.ceil(math.random(limits.min, limits.max));

        this.create_items(this.npc, section, count, probability);
      }
    }
  },
  create_items(npc: XR_game_object, section: TSection, count: number, probability: number): void {
    if (ammo[section as TAmmoItem]) {
      spawnAmmoForObject(npc, section as TAmmoItem, count);
    } else {
      spawnItemsForObject(npc, section, count, probability);
    }
  },
  keep_item(npc: XR_game_object, item: XR_game_object): void {
    const section: TSection = item.section();
    const ini: XR_ini_file = npc.spawn_ini();

    if (ini !== null && ini.section_exist("keep_items")) {
      logger.info("Keep item, listed in config:", npc.name(), item.name(), section);

      return;
    }

    if (isExcludedFromLootDropItem(item)) {
      logger.info("Release excluded from drop item:", npc.name(), item.name(), section);
      alife().release(alife().object(item.id()), true);

      return;
    }

    if (isArtefact(item)) {
      logger.info("Keep item, artefact:", npc.name(), item.name(), section);

      return;
    }

    if (section === misc.bolt) {
      logger.info("Keep item, bolt:", npc.name(), item.name(), section);

      return;
    }

    if (always_keep_item.get(section)) {
      logger.info("Keep item, always keep listed:", npc.name(), item.name(), section);

      return;
    }

    if (isWeapon(item)) {
      if (!isGrenade(item)) {
        setItemCondition(item, math.random(40, 80));
      }

      logger.info("Keep item, weapon", npc.name(), item.name(), item.clsid(), section);

      return;
    }

    if (isLootableItem(item) && !isAmmoItem(item)) {
      logger.info("Keep item, misc lootable", npc.name(), item.name(), section);

      return;
    }

    logger.info("Release loot item:", npc.name(), item.name(), section);
    alife().release(alife().object(item.id()), true);

    /**
     * commented in original:
     *   --[[
     *     const item_id = item:id()
     *     const item_in_slot = npc:item_in_slot(2)
     *     if item_in_slot ~= null and item_in_slot:id() === item_id then
     *       --' ��� ���� ��������� ������� ������
     *       item:set_condition((math.random(40)+40)/100)
     *       return
     *     end
     *     item_in_slot = npc:item_in_slot(3)
     *     if item_in_slot ~= null and item_in_slot:id() === item_id then
     *       --' ��� ���� ��������� ������� ������
     *       item:set_condition((math.random(40)+40)/100)
     *       return
     *     end
     *
     *   --  npc:mark_item_dropped(item)
     *     const item_in_slot = npc:item_in_slot(4)
     *     if item_in_slot ~= null and item_in_slot:id() === item_id  then
     *       return
     *     end
     *     if not npc:marked_dropped(item) then
     *   --    printf("releasing object ["..item:name().."]")
     *       alife():release(alife():object(item:id()), true)
     *     end
     *     ]]
     */
  },
  check_item_dependence(npc: XR_game_object, section: string): boolean {
    if (!item_dependence.has(section)) {
      return true;
    }

    let d_flag = true;

    for (const [k, v] of item_dependence.get(section)) {
      const obj = npc.object(k);

      if (obj !== null && npc.marked_dropped(obj) !== true) {
        return true;
      }

      d_flag = false;
    }

    return d_flag;
  },
} as IDropManager);

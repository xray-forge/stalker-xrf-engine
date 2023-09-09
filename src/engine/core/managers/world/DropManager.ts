import { alife, level } from "xray16";

import { DEATH_GENERIC_LTX, IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { Stalker } from "@/engine/core/objects/server/creature/Stalker";
import { abort } from "@/engine/core/utils/assertion";
import { parseNumbersList, parseStringsList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  getObjectCommunity,
  isAmmoSection,
  isArtefact,
  isExcludedFromLootDropItemSection,
  isGrenade,
  isLootableItemSection,
  isWeapon,
  setItemCondition,
  spawnItemsForObject,
} from "@/engine/core/utils/object";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { misc } from "@/engine/lib/constants/items/misc";
import { TLevel } from "@/engine/lib/constants/levels";
import { TRUE } from "@/engine/lib/constants/words";
import {
  ClientObject,
  IniFile,
  LuaArray,
  Optional,
  TCount,
  TProbability,
  TSection,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export interface IItemDropAmountDescriptor {
  min: TCount;
  max: TCount;
}

/**
 * todo;
 * todo: Maybe add reset method and re-assign all 5 objects with info on each reset to clear information.
 */
export class DropManager extends AbstractManager {
  public static readonly DEPENDENT_ITEMS_LTX_SECTION: TSection = "item_dependence";
  public static readonly KEEP_ITEMS_LTX_SECTION: TSection = "keep_items";
  public static readonly DONT_SPAWN_LOOT_LTX_SECTION: TSection = "dont_spawn_loot";
  public static readonly ITEM_COUNT_LTX_SECTION_BASE: TSection = "item_count_";

  /**
   * List of items by community that drop with specified probability.
   */
  protected readonly itemsByCommunity: LuaTable<TCommunity, LuaTable<TInventoryItem, TProbability>> = new LuaTable();

  /**
   * Dependent items by section id.
   * Example: specific weapon always should drop ammo for it.
   */
  protected readonly itemsDependencies: LuaTable<TStringId, LuaTable<TStringId, boolean>> = new LuaTable();

  /**
   * Multipliers to boost specific drop in levels.
   * Initialized on each load and is based on current actor level.
   */
  protected readonly itemsLevelDropMultiplayer: LuaTable<TStringId, number> = new LuaTable();

  /**
   * Items drop count range by level.
   */
  protected readonly itemsDropCountByLevel: LuaTable<TStringId, IItemDropAmountDescriptor> = new LuaTable();

  /**
   * List of items that should not be released.
   */
  protected readonly itemsAlwaysKept: LuaTable<TStringId, boolean> = new LuaTable();

  /**
   * Initialize game drop settings.
   * Expected to be called on each actor spawn event (level change, load, start game etc).
   */
  public override initialize(): void {
    // Initialize communities drop.
    for (const [community] of pairs(communities)) {
      const communityDrop: LuaTable<TInventoryItem, TProbability> = new LuaTable();

      if (DEATH_GENERIC_LTX.section_exist(community)) {
        const communityDropItemsCount: TCount = DEATH_GENERIC_LTX.line_count(community);

        for (const it of $range(0, communityDropItemsCount - 1)) {
          const [result, id, value] = DEATH_GENERIC_LTX.r_line(community, it, "", "");

          communityDrop.set(id as TInventoryItem, 100 * tonumber(value)!);
        }
      }

      this.itemsByCommunity.set(community, communityDrop);
    }

    // Initialize dependent items relation.
    const dependentItemsCount: number = DEATH_GENERIC_LTX.line_count(DropManager.DEPENDENT_ITEMS_LTX_SECTION);

    for (const it of $range(0, dependentItemsCount - 1)) {
      const [result, id, value] = DEATH_GENERIC_LTX.r_line(DropManager.DEPENDENT_ITEMS_LTX_SECTION, it, "", "");
      const itemDependencies: LuaTable<TStringId, boolean> = new LuaTable();

      const dependantItems: LuaArray<TStringId> = parseStringsList(value);

      for (const [k, v] of dependantItems) {
        itemDependencies.set(v, true);
      }

      this.itemsDependencies.set(id, itemDependencies);
    }

    // Initialize setting and multipliers based on level.
    // Enables level-based controls of current location drops and making some parts of the zone better in terms of drop.
    const currentLevelNameSection: TSection = DEATH_GENERIC_LTX.section_exist(level.name()) ? level.name() : "default";
    const levelSpecificDropsCount: number = DEATH_GENERIC_LTX.line_count(currentLevelNameSection);

    for (const it of $range(0, levelSpecificDropsCount - 1)) {
      const [result, id, value] = DEATH_GENERIC_LTX.r_line(currentLevelNameSection, it, "", "");

      this.itemsLevelDropMultiplayer.set(id as TLevel, tonumber(value)!);
    }

    // Initialize items drop count by selected game difficulty.
    const itemsDropSectionByDifficulty: TSection =
      DropManager.ITEM_COUNT_LTX_SECTION_BASE + level.get_game_difficulty();
    const itemsDropCountByDifficulty: TCount = DEATH_GENERIC_LTX.line_count(itemsDropSectionByDifficulty);

    for (const it of $range(0, itemsDropCountByDifficulty - 1)) {
      const [, key, value] = DEATH_GENERIC_LTX.r_line(itemsDropSectionByDifficulty, it, "", "");
      const sectionDropCount: LuaArray<TProbability> = parseNumbersList(value);

      if (!sectionDropCount.has(1)) {
        abort("Error on [death_ini] declaration. Section [%s], line [%s]", itemsDropSectionByDifficulty, tostring(key));
      }

      // Do not drop in level if not registered, declare as 0.
      if (!this.itemsLevelDropMultiplayer.has(key)) {
        this.itemsLevelDropMultiplayer.set(key, 0);
      }

      const min: TCount = sectionDropCount.get(1);
      const max: TCount = sectionDropCount.has(2) ? sectionDropCount.get(2) : min;

      this.itemsDropCountByLevel.set(key, {
        min: tonumber(min)! * this.itemsLevelDropMultiplayer.get(key),
        max: tonumber(max)! * this.itemsLevelDropMultiplayer.get(key),
      });
    }

    // Register items that should be kept.
    const keepItemsSectionItemsCount: TCount = DEATH_GENERIC_LTX.line_count(DropManager.KEEP_ITEMS_LTX_SECTION);

    for (const it of $range(0, keepItemsSectionItemsCount - 1)) {
      const [result, id, value] = DEATH_GENERIC_LTX.r_line(DropManager.KEEP_ITEMS_LTX_SECTION, it, "", "");

      if (value === TRUE) {
        this.itemsAlwaysKept.set(id, true);
      }
    }
  }

  /**
   * todo;
   *
   * @param object - target object to create release items.
   */
  public createCorpseReleaseItems(object: ClientObject): void {
    // logger.info("Create corpse release items:", object.name());

    const alifeObject: Optional<Stalker> = alife().object<Stalker>(object.id());

    if (alifeObject === null || alifeObject.isCorpseLootDropped) {
      return;
    }

    alifeObject.isCorpseLootDropped = true;
    object.iterate_inventory((object, item) => this.filterLootItem(object, item), object);

    if (object.spawn_ini().section_exist(DropManager.DONT_SPAWN_LOOT_LTX_SECTION)) {
      return;
    }

    const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

    if (state.ini?.line_exist(state.sectionLogic, DropManager.DONT_SPAWN_LOOT_LTX_SECTION)) {
      return;
    }

    const spawnItems: Optional<LuaTable<TInventoryItem, TProbability>> = this.itemsByCommunity.get(
      getObjectCommunity(object)
    );

    if (spawnItems === null) {
      return;
    }

    // Spawn dependent items (ammo etc) and corpse loot.
    for (const [section, probability] of spawnItems) {
      if (this.checkItemDependentDrops(object, section)) {
        if (!this.itemsDropCountByLevel.has(section)) {
          abort("Incorrect count settings in DropManager for object [%s].", section);
        }

        const limits: IItemDropAmountDescriptor = this.itemsDropCountByLevel.get(section);
        const count: TCount = math.ceil(math.random(limits.min, limits.max));

        if (count > 0 && probability > 0) {
          spawnItemsForObject(object, section, count, probability);
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  protected filterLootItem(object: ClientObject, item: ClientObject): void {
    const section: TSection = item.section();
    const ini: IniFile = object.spawn_ini();

    if (ini !== null && ini.section_exist("keep_items")) {
      // logger.info("Keep item, listed in config:", object.name(), item.name(), section);

      return;
    }

    if (isExcludedFromLootDropItemSection(section)) {
      alife().release(alife().object(item.id()), true);

      return;
    }

    if (isArtefact(item)) {
      return;
    }

    if (this.itemsAlwaysKept.get(section)) {
      // logger.info("Keep item, always keep listed:", object.name(), item.name(), section);

      return;
    }

    if (section === misc.bolt) {
      return;
    }

    if (isWeapon(item)) {
      if (!isGrenade(item)) {
        setItemCondition(
          item,
          math.random(
            logicsConfig.ITEMS.DROPPED_WEAPON_STATE_DEGRADATION.MIN,
            logicsConfig.ITEMS.DROPPED_WEAPON_STATE_DEGRADATION.MAX
          )
        );
      }

      // logger.info("Keep item, weapon", object.name(), item.name(), item.clsid(), section);

      return;
    }

    if (isLootableItemSection(item.section()) && !isAmmoSection(item.section())) {
      // logger.info("Keep item, misc lootable:", object.name(), item.name(), section);

      return;
    }

    // logger.info("Release loot item:", object.name(), item.name(), section);
    alife().release(alife().object(item.id()), true);
  }

  /**
   * todo: Description.
   */
  protected checkItemDependentDrops(object: ClientObject, section: TSection): boolean {
    if (!this.itemsDependencies.has(section)) {
      return true;
    }

    let isDependent: boolean = true;

    for (const [dependentSection, v] of this.itemsDependencies.get(section)) {
      const inventoryItem: Optional<ClientObject> = object.object(dependentSection);

      if (inventoryItem !== null && !object.marked_dropped(inventoryItem)) {
        return true;
      } else {
        isDependent = false;
      }
    }

    return isDependent;
  }

  /**
   * Handle client object death.
   * Spawn required loot, filter existing loot and mark state of items in inventory.
   *
   * @param object - client object facing death event
   */
  public onObjectDeath(object: ClientObject): void {
    this.createCorpseReleaseItems(object);
  }
}

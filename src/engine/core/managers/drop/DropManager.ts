import { IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { IItemDropAmountDescriptor } from "@/engine/core/managers/drop/drop_types";
import { DROP_MANAGER_CONFIG_LTX, dropConfig } from "@/engine/core/managers/drop/DropConfig";
import { readIniDropCountByLevel } from "@/engine/core/managers/drop/utils";
import { Stalker } from "@/engine/core/objects/creature/Stalker";
import { abort } from "@/engine/core/utils/assertion";
import { isArtefact, isGrenade, isWeapon } from "@/engine/core/utils/class_ids";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { setItemCondition } from "@/engine/core/utils/item";
import { isAmmoSection, isExcludedFromLootDropItemSection, isLootableItemSection } from "@/engine/core/utils/section";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { misc } from "@/engine/lib/constants/items/misc";
import { GameObject, IniFile, Optional, TCount, TProbability, TSection } from "@/engine/lib/types";

/**
 * todo;
 * todo: Maybe add reset method and re-assign all 5 objects with info on each reset to clear information.
 */
export class DropManager extends AbstractManager {
  public override initialize(): void {
    // Read after game is started and level/simulation is initialized.
    dropConfig.ITEMS_DROP_COUNT_BY_LEVEL = readIniDropCountByLevel(DROP_MANAGER_CONFIG_LTX);
  }

  /**
   * todo;
   *
   * @param object - target object to create release items.
   */
  public createCorpseReleaseItems(object: GameObject): void {
    const alifeObject: Optional<Stalker> = registry.simulator.object<Stalker>(object.id());

    if (alifeObject === null || alifeObject.isCorpseLootDropped) {
      return;
    }

    alifeObject.isCorpseLootDropped = true;
    object.iterate_inventory((object, item) => this.filterLootItem(object, item), object);

    if (object.spawn_ini()?.section_exist(dropConfig.DONT_SPAWN_LOOT_LTX_SECTION)) {
      return;
    }

    const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

    if (state.ini?.line_exist(state.sectionLogic, dropConfig.DONT_SPAWN_LOOT_LTX_SECTION)) {
      return;
    }

    const spawnItems: Optional<LuaTable<TInventoryItem, TProbability>> = dropConfig.ITEMS_BY_COMMUNITY.get(
      getObjectCommunity(object)
    );

    if (spawnItems === null) {
      return;
    }

    // Spawn dependent items (ammo etc) and corpse loot.
    for (const [section, probability] of spawnItems) {
      if (this.checkItemDependentDrops(object, section)) {
        if (!dropConfig.ITEMS_DROP_COUNT_BY_LEVEL.has(section)) {
          abort("Incorrect count settings in DropManager for object [%s].", section);
        }

        const limits: IItemDropAmountDescriptor = dropConfig.ITEMS_DROP_COUNT_BY_LEVEL.get(section);
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
  protected filterLootItem(object: GameObject, item: GameObject): void {
    const section: TSection = item.section();
    const ini: Optional<IniFile> = object.spawn_ini();

    if (ini && ini.section_exist("keep_items")) {
      return;
    }

    if (isExcludedFromLootDropItemSection(section)) {
      registry.simulator.release(registry.simulator.object(item.id()), true);

      return;
    }

    if (isArtefact(item)) {
      return;
    }

    if (dropConfig.ITEMS_KEEP.has(section)) {
      return;
    }

    if (section === misc.bolt) {
      return;
    }

    if (isWeapon(item)) {
      if (!isGrenade(item)) {
        setItemCondition(
          item,
          math.random(dropConfig.DROPPED_WEAPON_STATE_DEGRADATION.MIN, dropConfig.DROPPED_WEAPON_STATE_DEGRADATION.MAX)
        );
      }

      return;
    }

    if (isLootableItemSection(item.section()) && !isAmmoSection(item.section())) {
      return;
    }

    registry.simulator.release(registry.simulator.object(item.id()), true);
  }

  /**
   * todo: Description.
   */
  protected checkItemDependentDrops(object: GameObject, section: TSection): boolean {
    if (!dropConfig.ITEMS_DEPENDENCIES.has(section)) {
      return true;
    }

    let isDependent: boolean = true;

    for (const [dependentSection, v] of dropConfig.ITEMS_DEPENDENCIES.get(section)) {
      const inventoryItem: Optional<GameObject> = object.object(dependentSection);

      if (inventoryItem !== null && !object.marked_dropped(inventoryItem)) {
        return true;
      } else {
        isDependent = false;
      }
    }

    return isDependent;
  }

  /**
   * Handle game object death.
   * Spawn required loot, filter existing loot and mark state of items in inventory.
   * todo: implement with eventsManager, not direct call.
   *
   * @param object - game object facing death event
   */
  public onObjectDeath(object: GameObject): void {
    this.createCorpseReleaseItems(object);
  }
}

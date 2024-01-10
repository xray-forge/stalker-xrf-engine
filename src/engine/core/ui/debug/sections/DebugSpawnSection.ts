import { CUI3tButton, CUIComboBox, CUIListBox, CUIWindow, LuabindClass, ui_events } from "xray16";

import { Squad } from "@/engine/core/objects/squad";
import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { DebugItemListEntry } from "@/engine/core/ui/debug/sections/DebugItemListEntry";
import { getInventoryNameForItemSectionSafely } from "@/engine/core/utils/caption";
import { isGameStarted } from "@/engine/core/utils/game";
import { getSectionsWithoutStoryIDs, getSimulationGroupSections, getStalkerSections } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getNearestServerObject } from "@/engine/core/utils/registry";
import { spawnCreatureNearActor, spawnSquadInSmart } from "@/engine/core/utils/spawn";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { create2dVector, createEmpty2dVector } from "@/engine/core/utils/vector";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { LuaArray, Optional, ServerObject, TPath, TSection, Vector2D } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "menu\\debug\\DebugSpawnSection.component";

enum ESpawnCategory {
  STALKER = "stalkers_list",
  SIMULATION_GROUP = "simulation_group_list",
}

/**
 * Debug section to handle spawning of squads / creatures.
 */
@LuabindClass()
export class DebugSpawnSection extends AbstractDebugSection {
  public uiCategoriesList!: CUIComboBox;
  public uiItemsList!: CUIListBox<DebugItemListEntry>;
  public uiItemListMainSize!: Vector2D;
  public uiItemListNameSize!: Vector2D;
  public uiItemListDdSize!: Vector2D;
  public uiItemSpawnButton!: CUI3tButton;

  public initializeControls(): void {
    resolveXmlFile(base, this.xml);

    this.uiCategoriesList = this.xml.InitComboBox("creatures_categories_list", this);

    this.xml.InitFrame("items_list_frame", this);
    this.uiItemsList = this.xml.InitListBox("items_list", this);
    this.uiItemsList.ShowSelectedItem(true);

    const window: CUIWindow = new CUIWindow();

    this.xml.InitWindow("spawn_item:main", 0, window);
    this.uiItemListMainSize = create2dVector(window.GetWidth(), window.GetHeight());
    this.xml.InitWindow("spawn_item:fn", 0, window);
    this.uiItemListNameSize = create2dVector(window.GetWidth(), window.GetHeight());
    this.xml.InitWindow("spawn_item:fd", 0, window);
    this.uiItemListDdSize = create2dVector(window.GetWidth(), window.GetHeight());

    this.uiItemSpawnButton = this.xml.Init3tButton("spawn_creature_button", this);

    this.owner.Register(this.uiItemsList, "items_list");
    this.owner.Register(this.uiCategoriesList, "creatures_categories_list");
    this.owner.Register(this.uiItemSpawnButton, "spawn_creature_button");
  }

  public override initializeCallBacks(): void {
    this.owner.AddCallback(
      "creatures_categories_list",
      ui_events.LIST_ITEM_SELECT,
      () => this.onCategoryChange(),
      this
    );
    this.owner.AddCallback("spawn_creature_button", ui_events.BUTTON_CLICKED, () => this.onCreatureSpawn(), this);
  }

  public override initializeState(): void {
    Object.values(ESpawnCategory)
      .sort((a, b) => ((a as unknown as number) > (b as unknown as number) ? 1 : -1))
      .forEach((it, index) => this.uiCategoriesList.AddItem(it, index));

    this.uiCategoriesList.SetCurrentID(0);

    this.fillItemsList(this.uiCategoriesList.GetText() as ESpawnCategory);
  }

  public fillItemsList(category: ESpawnCategory): void {
    this.uiItemsList.RemoveAll();

    switch (category) {
      case ESpawnCategory.SIMULATION_GROUP:
        this.addItemsToList(getSectionsWithoutStoryIDs(getSimulationGroupSections()));
        break;

      case ESpawnCategory.STALKER: {
        this.addItemsToList(getSectionsWithoutStoryIDs(getStalkerSections()));
        break;
      }
    }
  }

  /**
   * Add item to spawn list UI element.
   */
  public addItemsToList(sections: Array<TSection> | LuaArray<TSection>): void {
    (sections as Array<TSection>)
      .sort((a, b) => ((a as unknown as number) > (b as unknown as number) ? 1 : -1))
      .forEach((it) => this.addItemToList(it));
  }

  /**
   * Add item to spawn list UI element.
   */
  public addItemToList(section: TSection): void {
    const spawnItem: DebugItemListEntry = new DebugItemListEntry(
      this.uiItemListMainSize.y,
      this.uiItemListDdSize.x,
      section
    );

    spawnItem.SetWndSize(this.uiItemListMainSize);
    spawnItem.uiInnerNameText.SetWndPos(createEmpty2dVector());
    spawnItem.uiInnerNameText.SetWndSize(this.uiItemListNameSize);
    spawnItem.uiInnerNameText.SetText(getInventoryNameForItemSectionSafely(section));
    spawnItem.uiInnerSectionText.SetWndPos(create2dVector(this.uiItemListNameSize.x + 4, 0));
    spawnItem.uiInnerSectionText.SetWndSize(this.uiItemListDdSize);

    this.uiItemsList.AddExistingItem(spawnItem);
  }

  /**
   * Change category of spawn lists.
   */
  public onCategoryChange(): void {
    this.fillItemsList(this.uiCategoriesList.GetText() as ESpawnCategory);
  }

  /**
   * Spawn creatures before actor / in nearest smart.
   */
  public onCreatureSpawn(): void {
    if (!isGameStarted()) {
      return logger.format("Cannot spawn, game is not started");
    }

    const category: ESpawnCategory = this.uiCategoriesList.GetText() as ESpawnCategory;
    const itemSelected: Optional<DebugItemListEntry> = this.uiItemsList.GetSelectedItem();
    const section: Optional<TInventoryItem> = itemSelected?.uiInnerSectionText.GetText() as Optional<TInventoryItem>;

    if (section) {
      logger.format("Spawn: %s", section);

      // For regular stalkers just create an object. In case of squad spawn for nearest smart terrain.
      if (category === ESpawnCategory.STALKER) {
        const object: ServerObject = spawnCreatureNearActor(section, 10);

        logger.format("Spawned: %s", object.name());
      } else {
        const nearestSmart: Optional<ServerObject> = getNearestServerObject(
          (it: ServerObject): boolean => it.section_name() === "smart_terrain",
          true
        );

        if (nearestSmart) {
          const object: Squad = spawnSquadInSmart(section, nearestSmart.name());

          logger.format("Spawned: %s", object.name());
        } else {
          logger.format("Skip squad spawn, nearest smart not accessible");
        }
      }
    } else {
      logger.format("No selected target for spawn");
    }
  }
}

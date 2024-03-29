import { CUI3tButton, CUIComboBox, CUIListBox, CUIWindow, LuabindClass, ui_events } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { DebugItemListEntry } from "@/engine/core/ui/debug/sections/DebugItemListEntry";
import { getInventoryNameForItemSectionSafely } from "@/engine/core/utils/caption";
import { isGameStarted } from "@/engine/core/utils/game";
import {
  getAmmoSections,
  getArtefactsSections,
  getBoosterSections,
  getDetectorsSections,
  getHelmetsSections,
  getOutfitSections,
  getWeaponSections,
} from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isAmmoSection } from "@/engine/core/utils/section";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { create2dVector, createEmpty2dVector } from "@/engine/core/utils/vector";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { LuaArray, Optional, TPath, TSection, Vector2D } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "menu\\debug\\DebugItemsSection.component";

enum EItemCategory {
  AMMO = "ammo",
  ARTEFACTS = "artefacts",
  CONSUMABLES = "consumables",
  DETECTORS = "detectors",
  HELMETS = "helmets",
  OUTFITS = "outfits",
  WEAPONS = "weapons",
}

/**
 * Debug list of accessible actions.
 * Allows navigation over available items and spawning them.
 */
@LuabindClass()
export class DebugItemsSection extends AbstractDebugSection {
  public uiCategoriesList!: CUIComboBox;
  public uiItemsList!: CUIListBox<DebugItemListEntry>;
  public uiItemListMainSize!: Vector2D;
  public uiItemListNameSize!: Vector2D;
  public uiItemListDdSize!: Vector2D;
  public uiItemSpawnButton!: CUI3tButton;

  public initializeControls(): void {
    resolveXmlFile(base, this.xml);

    this.uiCategoriesList = this.xml.InitComboBox("categories_list", this);

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

    this.uiItemSpawnButton = this.xml.Init3tButton("spawn_button", this);

    this.owner.Register(this.uiItemsList, "items_list");
    this.owner.Register(this.uiCategoriesList, "categories_list");
    this.owner.Register(this.uiItemSpawnButton, "spawn_button");
  }

  public override initializeCallBacks(): void {
    this.owner.AddCallback("categories_list", ui_events.LIST_ITEM_SELECT, () => this.onCategoryChange(), this);
    this.owner.AddCallback("spawn_button", ui_events.BUTTON_CLICKED, () => this.onItemSpawn(), this);
  }

  public override initializeState(): void {
    Object.values(EItemCategory)
      .sort((a, b) => ((a as unknown as number) > (b as unknown as number) ? 1 : -1))
      .forEach((it, index) => this.uiCategoriesList.AddItem(it, index));

    this.uiCategoriesList.SetCurrentID(0);

    this.fillItemsList(this.uiCategoriesList.GetText() as EItemCategory);
  }

  public fillItemsList(category: EItemCategory): void {
    this.uiItemsList.RemoveAll();

    switch (category) {
      case EItemCategory.OUTFITS:
        this.addItemsToList(getOutfitSections());
        break;

      case EItemCategory.HELMETS:
        this.addItemsToList(getHelmetsSections());
        break;

      case EItemCategory.WEAPONS: {
        this.addItemsToList(getWeaponSections());
        break;
      }

      case EItemCategory.ARTEFACTS:
        this.addItemsToList(getArtefactsSections());
        break;

      case EItemCategory.DETECTORS:
        this.addItemsToList(getDetectorsSections());
        break;

      case EItemCategory.AMMO:
        this.addItemsToList(getAmmoSections());
        break;

      case EItemCategory.CONSUMABLES:
        this.addItemsToList(getBoosterSections());
        break;
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
   * Change category of item lists.
   */
  public onCategoryChange(): void {
    this.fillItemsList(this.uiCategoriesList.GetText() as EItemCategory);
  }

  /**
   * Spawn item for actor.
   */
  public onItemSpawn(): void {
    if (!isGameStarted()) {
      return logger.info("Cannot spawn, game is not started");
    }

    const itemSelected: Optional<DebugItemListEntry> = this.uiItemsList.GetSelectedItem();
    const section: Optional<TInventoryItem> = itemSelected?.uiInnerSectionText.GetText() as Optional<TInventoryItem>;

    if (section) {
      logger.info("Item spawn: %s", section);

      spawnItemsForObject(registry.actor, section, isAmmoSection(section) ? 30 : 1);
    } else {
      logger.info("No selected item for spawn");
    }
  }
}

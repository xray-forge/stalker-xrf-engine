import { CUI3tButton, CUIComboBox, CUIListBox, CUIWindow, LuabindClass, ui_events, vector2 } from "xray16";

import { registry, SYSTEM_INI } from "@/engine/core/database";
import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { DebugItemListEntry } from "@/engine/core/ui/debug/sections/DebugItemListEntry";
import { isGameStarted } from "@/engine/core/utils/alife";
import { isAmmoSection } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getInventoryNameForItemSection, spawnItemsForObject } from "@/engine/core/utils/spawn";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { artefacts } from "@/engine/lib/constants/items/artefacts";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { food } from "@/engine/lib/constants/items/food";
import { helmets } from "@/engine/lib/constants/items/helmets";
import { outfits } from "@/engine/lib/constants/items/outfits";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { Optional, TPath, TSection } from "@/engine/lib/types";

const base: TPath = "menu\\debug\\DebugItemsSection.component";
const logger: LuaLogger = new LuaLogger($filename);

enum EItemCategory {
  AMMO = "ammo",
  ARTEFACTS = "artefacts",
  CONSUMABLES = "consumables",
  OUTFITS = "outfits",
  HELMETS = "helmets",
  WEAPONS = "weapons",
}

/**
 * todo;
 */
@LuabindClass()
export class DebugItemsSection extends AbstractDebugSection {
  public categoriesList!: CUIComboBox;
  public itemsList!: CUIListBox<DebugItemListEntry>;
  public itemListMainSize!: vector2;
  public itemListNameSize!: vector2;
  public itemListDdSize!: vector2;
  public itemSpawnButton!: CUI3tButton;

  public initializeControls(): void {
    resolveXmlFile(base, this.xml);

    this.categoriesList = this.xml.InitComboBox("categories_list", this);

    this.xml.InitFrame("items_list_frame", this);
    this.itemsList = this.xml.InitListBox("items_list", this);
    this.itemsList.ShowSelectedItem(true);

    const window: CUIWindow = new CUIWindow();

    this.xml.InitWindow("spawn_item:main", 0, window);
    this.itemListMainSize = new vector2().set(window.GetWidth(), window.GetHeight());
    this.xml.InitWindow("spawn_item:fn", 0, window);
    this.itemListNameSize = new vector2().set(window.GetWidth(), window.GetHeight());
    this.xml.InitWindow("spawn_item:fd", 0, window);
    this.itemListDdSize = new vector2().set(window.GetWidth(), window.GetHeight());

    this.itemSpawnButton = this.xml.Init3tButton("spawn_button", this);

    this.owner.Register(this.itemsList, "items_list");
    this.owner.Register(this.categoriesList, "categories_list");
    this.owner.Register(this.itemSpawnButton, "spawn_button");
  }

  public initializeCallBacks(): void {
    this.owner.AddCallback("categories_list", ui_events.LIST_ITEM_SELECT, () => this.onCategoryChange(), this);
    this.owner.AddCallback("spawn_button", ui_events.BUTTON_CLICKED, () => this.onItemSpawn(), this);
  }

  public initializeState(): void {
    Object.values(EItemCategory)
      .sort((a, b) => ((a as unknown as number) > (b as unknown as number) ? 1 : -1))
      .forEach((it, index) => this.categoriesList.AddItem(it, index));

    this.categoriesList.SetCurrentID(0);

    this.fillItemsList(this.categoriesList.GetText() as EItemCategory);
  }

  public fillItemsList(category: EItemCategory): void {
    this.itemsList.RemoveAll();

    switch (category) {
      case EItemCategory.OUTFITS:
        this.addItemsToList(Object.values(outfits));
        break;

      case EItemCategory.HELMETS:
        this.addItemsToList(Object.values(helmets));
        break;

      case EItemCategory.WEAPONS:
        this.addItemsToList(Object.values(weapons));
        break;

      case EItemCategory.ARTEFACTS:
        this.addItemsToList(Object.values(artefacts));
        break;

      case EItemCategory.AMMO:
        this.addItemsToList(Object.values(ammo));
        break;

      case EItemCategory.CONSUMABLES:
        this.addItemsToList(Object.values({ ...drugs, ...food }));
        break;
    }
  }

  /**
   * Add item to spawn list UI element.
   */
  public addItemsToList(sections: Array<TSection>): void {
    sections
      .filter((it: TSection) => SYSTEM_INI.section_exist(it))
      .sort((a, b) => ((a as unknown as number) > (b as unknown as number) ? 1 : -1))
      .forEach((it) => this.addItemToList(it));
  }

  /**
   * Add item to spawn list UI element.
   */
  public addItemToList(section: TSection): void {
    const spawnItem: DebugItemListEntry = new DebugItemListEntry(
      this.itemListMainSize.y,
      this.itemListDdSize.x,
      section
    );

    spawnItem.SetWndSize(this.itemListMainSize);
    spawnItem.innerNameText.SetWndPos(new vector2().set(0, 0));
    spawnItem.innerNameText.SetWndSize(this.itemListNameSize);
    spawnItem.innerNameText.SetText(getInventoryNameForItemSection(section));
    spawnItem.innerSectionText.SetWndPos(new vector2().set(this.itemListNameSize.x + 4, 0));
    spawnItem.innerSectionText.SetWndSize(this.itemListDdSize);

    this.itemsList.AddExistingItem(spawnItem);
  }

  /**
   * Change category of item lists.
   */
  public onCategoryChange(): void {
    this.fillItemsList(this.categoriesList.GetText() as EItemCategory);
  }

  /**
   * Spawn item for actor.
   */
  public onItemSpawn(): void {
    if (!isGameStarted()) {
      return logger.info("Cannot spawn, game is not started");
    }

    const itemSelected: Optional<DebugItemListEntry> = this.itemsList.GetSelectedItem();
    const section: Optional<TInventoryItem> = itemSelected?.innerSectionText.GetText() as Optional<TInventoryItem>;

    if (section) {
      logger.info("Item spawn:", section);

      spawnItemsForObject(registry.actor, section, isAmmoSection(section) ? 30 : 1);
    } else {
      logger.info("No selected item for spawn");
    }
  }
}

import { CUI3tButton, CUIComboBox, CUIListBox, CUIWindow, game, level, LuabindClass, ui_events, vector2 } from "xray16";

import { registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { DebugTeleportListEntry } from "@/engine/core/ui/debug/sections/DebugTeleportListEntry";
import { executeConsoleCommand, isGameStarted } from "@/engine/core/utils/game";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getServerObjects, isGameVertexFromLevel } from "@/engine/core/utils/object";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { vectorToString } from "@/engine/core/utils/vector";
import { postProcessors } from "@/engine/lib/constants/animation";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { LuaArray, Optional, TPath, Vector2D } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "menu\\debug\\DebugTeleportSection.component";

enum ETeleportCategory {
  SMART_TERRAIN = "smart_terrain",
}

/**
 * todo;
 */
@LuabindClass()
export class DebugTeleportSection extends AbstractDebugSection {
  public uiCategoriesList!: CUIComboBox;
  public uiItemsList!: CUIListBox<DebugTeleportListEntry>;
  public uiItemListMainSize!: Vector2D;
  public uiItemListNameSize!: Vector2D;
  public uiItemListDdSize!: Vector2D;
  public uiItemTeleportButton!: CUI3tButton;

  public initializeControls(): void {
    resolveXmlFile(base, this.xml);

    this.uiCategoriesList = this.xml.InitComboBox("coordinates_categories_list", this);

    this.xml.InitFrame("items_list_frame", this);
    this.uiItemsList = this.xml.InitListBox("items_list", this);
    this.uiItemsList.ShowSelectedItem(true);

    const window: CUIWindow = new CUIWindow();

    this.xml.InitWindow("teleport_item:main", 0, window);
    this.uiItemListMainSize = new vector2().set(window.GetWidth(), window.GetHeight());
    this.xml.InitWindow("teleport_item:fn", 0, window);
    this.uiItemListNameSize = new vector2().set(window.GetWidth(), window.GetHeight());
    this.xml.InitWindow("teleport_item:fd", 0, window);
    this.uiItemListDdSize = new vector2().set(window.GetWidth(), window.GetHeight());

    this.uiItemTeleportButton = this.xml.Init3tButton("teleport_button", this);

    this.owner.Register(this.uiItemsList, "items_list");
    this.owner.Register(this.uiCategoriesList, "coordinates_categories_list");
    this.owner.Register(this.uiItemTeleportButton, "teleport_button");
  }

  public override initializeCallBacks(): void {
    this.owner.AddCallback(
      "coordinates_categories_list",
      ui_events.LIST_ITEM_SELECT,
      () => this.onCategoryChange(),
      this
    );
    this.owner.AddCallback("teleport_button", ui_events.BUTTON_CLICKED, () => this.onTeleport(), this);
    this.owner.AddCallback("items_list", ui_events.WINDOW_LBUTTON_DB_CLICK, () => this.onTeleport(true), this);
  }

  public initializeState(): void {
    Object.values(ETeleportCategory)
      .sort((a, b) => ((a as unknown as number) > (b as unknown as number) ? 1 : -1))
      .forEach((it, index) => this.uiCategoriesList.AddItem(it, index));

    this.uiCategoriesList.SetCurrentID(0);

    this.fillItemsList(this.uiCategoriesList.GetText() as ETeleportCategory);
  }

  public fillItemsList(category: ETeleportCategory): void {
    this.uiItemsList.RemoveAll();

    switch (category) {
      case ETeleportCategory.SMART_TERRAIN: {
        const smartTerrains: LuaArray<SmartTerrain> = getServerObjects((it) => it.section_name() === "smart_terrain");

        (smartTerrains as unknown as Array<SmartTerrain>)
          .sort((a, b) => ((a.name() as unknown as number) > (b.name() as unknown as number) ? 1 : -1))
          .forEach((it) => this.addSmartTerrainToList(it));
        break;
      }
    }
  }

  /**
   * Add item to spawn list UI element.
   */
  public addSmartTerrainToList(smartTerrain: SmartTerrain): void {
    const teleportItem: DebugTeleportListEntry = new DebugTeleportListEntry(
      this.uiItemListMainSize.y,
      this.uiItemListDdSize.x,
      smartTerrain.name(),
      string.format(
        "%s - %s",
        game.translate_string(smartTerrain.getNameCaption()),
        vectorToString(smartTerrain.position)
      ),
      smartTerrain.position,
      smartTerrain.m_level_vertex_id,
      smartTerrain.m_game_vertex_id
    );

    teleportItem.SetWndSize(this.uiItemListMainSize);
    teleportItem.uiInnerNameText.SetWndPos(new vector2().set(0, 0));
    teleportItem.uiInnerNameText.SetWndSize(this.uiItemListNameSize);
    teleportItem.uiInnerSectionText.SetWndPos(new vector2().set(this.uiItemListNameSize.x + 4, 0));
    teleportItem.uiInnerSectionText.SetWndSize(this.uiItemListDdSize);

    this.uiItemsList.AddExistingItem(teleportItem);
  }

  /**
   * Change category of item lists.
   */
  public onCategoryChange(): void {
    this.fillItemsList(this.uiCategoriesList.GetText() as ETeleportCategory);
  }

  /**
   * Spawn item for actor.
   */
  public onTeleport(isInstant?: boolean): void {
    if (!isGameStarted()) {
      return logger.info("Cannot teleport, game is not started");
    }

    const itemSelected: Optional<DebugTeleportListEntry> = this.uiItemsList.GetSelectedItem();

    if (itemSelected) {
      logger.info("Teleporting actor:", vectorToString(itemSelected.position), itemSelected.gvid, itemSelected.lvid);

      level.add_pp_effector(postProcessors.teleport, 2006, false);

      if (isGameVertexFromLevel(level.name(), itemSelected.gvid)) {
        registry.actor.set_actor_position(itemSelected.position);
      } else {
        game.jump_to_level(itemSelected.position, itemSelected.lvid, itemSelected.gvid);
      }

      if (isInstant) {
        this.closeMenu();
      }
    } else {
      logger.info("No selected target for teleport");
    }
  }

  public closeMenu(): void {
    executeConsoleCommand(consoleCommands.main_menu, "off");
    EventsManager.emitEvent(EGameEvent.MAIN_MENU_OFF);
  }
}

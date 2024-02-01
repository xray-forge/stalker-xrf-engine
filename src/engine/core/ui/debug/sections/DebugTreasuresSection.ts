import { CUI3tButton, CUIEditBox, CUIListBox, CUIStatic, game, level, LuabindClass, ui_events } from "xray16";

import { getManager, registry } from "@/engine/core/database";
import { StatisticsManager } from "@/engine/core/managers/statistics";
import { ITreasureDescriptor, treasureConfig, TreasureManager } from "@/engine/core/managers/treasures";
import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { isGameStarted } from "@/engine/core/utils/game";
import { EElementType, initializeElement, initializeStatics, resolveXmlFile } from "@/engine/core/utils/ui";
import { isGameVertexFromLevel } from "@/engine/core/utils/vertex";
import { Optional, ServerObject, TCount, TLabel, TNumberId, TPath, TSection, XmlInit } from "@/engine/lib/types";

const base: TPath = "menu\\debug\\DebugTreasuresSection.component";

/**
 * Section of debug menu to handle generic information / generic actions.
 */
@LuabindClass()
export class DebugTreasuresSection extends AbstractDebugSection {
  public uiFoundTreasuresLabel!: CUIStatic;
  public uiTotalTreasuresLabel!: CUIStatic;
  public uiGivenTreasuresLabel!: CUIStatic;
  public uiTreasureInfoLabel!: CUIStatic;

  public uiGiveTreasuresButton!: CUI3tButton;
  public uiGiveRandomTreasuresButton!: CUI3tButton;
  public uiGiveSpecificTreasureButton!: CUI3tButton;
  public uiTeleportToSpecificTreasureButton!: CUI3tButton;

  public uiTreasuresList!: CUIListBox;
  public uiTreasuresListEditBox!: CUIEditBox;

  public currentFilter: string = "";
  public currentSection: Optional<TSection> = null;

  /**
   * Initialize UI control elements.
   */
  public override initializeControls(): void {
    const xml: XmlInit = resolveXmlFile(base, this.xml);

    initializeStatics(
      xml,
      this,
      "preview_texture_common",
      "preview_texture_rare",
      "preview_texture_epic",
      "preview_texture_unique"
    );

    initializeElement(xml, EElementType.FRAME, "treasures_list_frame", this);

    this.uiTotalTreasuresLabel = initializeElement(xml, EElementType.STATIC, "total_treasures_count_label", this);
    this.uiGivenTreasuresLabel = initializeElement(xml, EElementType.STATIC, "given_treasures_count_label", this);
    this.uiFoundTreasuresLabel = initializeElement(xml, EElementType.STATIC, "found_treasures_count_label", this);
    this.uiTreasureInfoLabel = initializeElement(xml, EElementType.STATIC, "treasure_info_label", this);

    this.uiGiveRandomTreasuresButton = initializeElement(
      xml,
      EElementType.BUTTON,
      "give_random_treasures_button",
      this,
      {
        context: this.owner,
        [ui_events.BUTTON_CLICKED]: () => this.onGiveRandomTreasuresButtonClicked(),
      }
    );
    this.uiGiveTreasuresButton = initializeElement(xml, EElementType.BUTTON, "give_treasures_button", this, {
      context: this.owner,
      [ui_events.BUTTON_CLICKED]: () => this.onGiveAllTreasuresButtonClicked(),
    });

    this.uiGiveSpecificTreasureButton = initializeElement(
      xml,
      EElementType.BUTTON,
      "give_specific_treasure_button",
      this,
      {
        context: this.owner,
        [ui_events.BUTTON_CLICKED]: () => this.onGiveSpecificTreasureButtonClicked(),
      }
    );

    this.uiTeleportToSpecificTreasureButton = initializeElement(
      xml,
      EElementType.BUTTON,
      "teleport_to_specific_treasure_button",
      this,
      {
        context: this.owner,
        [ui_events.BUTTON_CLICKED]: () => this.onTeleportToTreasureClicked(),
      }
    );

    this.uiTreasuresList = initializeElement(xml, EElementType.LIST_BOX, "treasures_list", this, {
      context: this.owner,
      [ui_events.LIST_ITEM_SELECT]: () => this.onSelectedTreasureChange(),
    });

    this.uiTreasuresListEditBox = initializeElement(xml, EElementType.EDIT_BOX, "treasures_filter_box", this, {
      context: this.owner,
      [ui_events.EDIT_TEXT_COMMIT]: () => this.onSelectedTreasureFilterChange(),
    });
  }

  /**
   * Initialize section state from current state.
   */
  public override initializeState(): void {
    const treasureManager: TreasureManager = getManager(TreasureManager);
    const statisticManager: StatisticsManager = getManager(StatisticsManager);

    this.uiTotalTreasuresLabel
      .TextControl()
      .SetText(string.format("Total treasures: %s", treasureManager.getTreasuresCount()));
    this.uiGivenTreasuresLabel
      .TextControl()
      .SetText(string.format("Given treasures: %s", treasureManager.getGivenTreasuresCount()));
    this.uiFoundTreasuresLabel
      .TextControl()
      .SetText(string.format("Found treasures: %s", statisticManager.actorStatistics.collectedTreasuresCount));

    this.uiTreasuresList.RemoveAll();

    for (const [section] of treasureConfig.TREASURES) {
      // Apply treasure filtering.
      if (this.currentFilter === null || this.currentFilter === "" || section.includes(this.currentFilter)) {
        this.uiTreasuresList.AddTextItem(section);
      }
    }

    this.uiTreasureInfoLabel.TextControl().SetText(this.getTreasureDescription(this.currentSection));
  }

  /**
   * @param section - descriptor section to build label for
   * @returns label with debug information for the treasure
   */
  public getTreasureDescription(section: Optional<TSection>): TLabel {
    if (section) {
      const treasure: ITreasureDescriptor = treasureConfig.TREASURES.get(section);

      let totalItems: TCount = 0;
      let base: TLabel = `given: ${treasure.given} | checked: ${treasure.checked} | refreshing: ${
        treasure.refreshing !== null
      } | empty: ${treasure.refreshing !== null} |\n items remain: ${treasure.itemsToFindRemain} | `;

      if (table.size(treasure.items) > 0) {
        for (const [section, list] of treasure.items) {
          base += string.format("%s : %s | ", section, table.size(list));

          for (const [, itemDescriptor] of list) {
            totalItems += itemDescriptor.count;
          }
        }
      }

      base += string.format("total items: %s | type: %s", totalItems, treasure.type);

      return base;
    }

    return "";
  }

  /**
   * Changed active treasure in the list.
   */
  public onSelectedTreasureChange(): void {
    this.currentSection = this.uiTreasuresList.GetSelectedItem()?.GetTextItem().GetText() as Optional<TLabel>;
    this.uiTreasureInfoLabel.TextControl().SetText(this.getTreasureDescription(this.currentSection));
  }

  /**
   * Input with selected treasure filter value changed.
   */
  public onSelectedTreasureFilterChange(): void {
    this.currentSection = null;
    this.currentFilter = this.uiTreasuresListEditBox.GetText();
    this.initializeState();
  }

  /**
   * Clicked `teleport to treasure` control.
   */
  public onTeleportToTreasureClicked(): void {
    if (!isGameStarted() || this.currentSection === null) {
      return;
    }

    const treasureManager: TreasureManager = getManager(TreasureManager);
    const restrictorId: Optional<TNumberId> = treasureManager.treasuresRestrictorByName.get(this.currentSection);
    const object: Optional<ServerObject> = restrictorId === null ? null : registry.simulator.object(restrictorId);

    if (!object) {
      return;
    }

    if (isGameVertexFromLevel(level.name(), object.m_game_vertex_id)) {
      registry.actor.set_actor_position(object.position);
    } else {
      game.jump_to_level(object.position, object.m_level_vertex_id, object.m_game_vertex_id);
    }
  }

  /**
   * Give all treasures for the actor.
   */
  public onGiveAllTreasuresButtonClicked(): void {
    if (isGameStarted()) {
      getManager(TreasureManager).giveActorAllTreasureCoordinates();
    }
  }

  /**
   * Give random treasures for the actor.
   */
  public onGiveRandomTreasuresButtonClicked(): void {
    if (isGameStarted()) {
      getManager(TreasureManager).giveActorRandomTreasureCoordinates();
    }
  }

  /**
   * Give specific treasures for the actor.
   */
  public onGiveSpecificTreasureButtonClicked(): void {
    if (!isGameStarted() || this.currentSection === null) {
      return;
    }

    getManager(TreasureManager).giveActorTreasureCoordinates(this.currentSection);
  }
}

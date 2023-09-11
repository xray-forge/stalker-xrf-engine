import { CUI3tButton, CUIComboBox, CUIEditBox, CUIStatic, LuabindClass, ui_events } from "xray16";

import { StatisticsManager } from "@/engine/core/managers/statistics";
import { ITreasureDescriptor, TreasureManager } from "@/engine/core/managers/treasures";
import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { isGameStarted } from "@/engine/core/utils/game";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EElementType, registerUiElement, resolveXmlFile } from "@/engine/core/utils/ui";
import { Optional, TCount, TIndex, TLabel, TPath, TSection, XmlInit } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
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
  public uiResetTreasuresButton!: CUI3tButton;
  public uiResetSpecificTreasureButton!: CUI3tButton;
  public uiTeleportToSpecificTreasureButton!: CUI3tButton;

  public uiTreasuresListComboBox!: CUIComboBox;
  public uiTreasuresListEditBox!: CUIEditBox;

  public currentFilter: string = "";
  public currentSection: Optional<TSection> = null;

  /**
   * Initialize UI control elements.
   */
  public override initializeControls(): void {
    const xml: XmlInit = resolveXmlFile(base, this.xml);

    this.uiTotalTreasuresLabel = registerUiElement(xml, "total_treasures_count_label", {
      base: this,
      type: EElementType.STATIC,
    });
    this.uiGivenTreasuresLabel = registerUiElement(xml, "given_treasures_count_label", {
      base: this,
      type: EElementType.STATIC,
    });
    this.uiFoundTreasuresLabel = registerUiElement(xml, "found_treasures_count_label", {
      base: this,
      type: EElementType.STATIC,
    });
    this.uiTreasureInfoLabel = registerUiElement(xml, "treasure_info_label", {
      base: this,
      type: EElementType.STATIC,
    });

    this.uiGiveRandomTreasuresButton = registerUiElement(xml, "give_random_treasures_button", {
      type: EElementType.BUTTON,
      base: this,
      context: this.owner,
      handlers: {
        [ui_events.BUTTON_CLICKED]: () => this.onGiveRandomTreasuresButtonClicked(),
      },
    });
    this.uiGiveTreasuresButton = registerUiElement(xml, "give_treasures_button", {
      type: EElementType.BUTTON,
      base: this,
      context: this.owner,
      handlers: {
        [ui_events.BUTTON_CLICKED]: () => this.onGiveAllTreasuresButtonClicked(),
      },
    });
    this.uiResetTreasuresButton = registerUiElement(xml, "reset_treasures_button", {
      type: EElementType.BUTTON,
      base: this,
      context: this.owner,
      handlers: {
        [ui_events.BUTTON_CLICKED]: () => this.onResetAllTreasuresButtonClicked(),
      },
    });

    this.uiGiveSpecificTreasureButton = registerUiElement(xml, "give_specific_treasure_button", {
      type: EElementType.BUTTON,
      base: this,
      context: this.owner,
      handlers: {
        [ui_events.BUTTON_CLICKED]: () => this.onGiveSpecificTreasureButtonClicked(),
      },
    });

    this.uiResetSpecificTreasureButton = registerUiElement(xml, "reset_specific_treasure_button", {
      type: EElementType.BUTTON,
      base: this,
      context: this.owner,
      handlers: {
        [ui_events.BUTTON_CLICKED]: () => this.onResetSpecificTreasuresButtonClicked(),
      },
    });

    this.uiTeleportToSpecificTreasureButton = registerUiElement(xml, "teleport_to_specific_treasure_button", {
      type: EElementType.BUTTON,
      base: this,
      context: this.owner,
      handlers: {
        [ui_events.BUTTON_CLICKED]: () => this.onTeleportToTreasureClicked(),
      },
    });

    this.uiTreasuresListComboBox = registerUiElement(xml, "treasures_combo_box", {
      type: EElementType.COMBO_BOX,
      base: this,
      context: this.owner,
      handlers: {
        [ui_events.LIST_ITEM_SELECT]: () => this.onSelectedTreasureChange(),
      },
    });

    this.uiTreasuresListEditBox = registerUiElement(xml, "treasures_edit_box", {
      type: EElementType.EDIT_BOX,
      base: this,
      context: this.owner,
      handlers: {
        [ui_events.EDIT_TEXT_COMMIT]: () => this.onSelectedTreasureFilterChange(),
      },
    });
  }

  /**
   * Initialize section state from current state.
   */
  public override initializeState(): void {
    const treasureManager: TreasureManager = TreasureManager.getInstance();
    const statisticManager: StatisticsManager = StatisticsManager.getInstance();

    this.uiTotalTreasuresLabel
      .TextControl()
      .SetText(string.format("Total treasures: %s", treasureManager.getTreasuresCount()));
    this.uiGivenTreasuresLabel
      .TextControl()
      .SetText(string.format("Given treasures: %s", treasureManager.getGivenTreasuresCount()));
    this.uiFoundTreasuresLabel
      .TextControl()
      .SetText(string.format("Found treasures: %s", statisticManager.actorStatistics.collectedTreasuresCount));

    this.uiTreasuresListComboBox.ClearList();

    let index: TIndex = 0;

    for (const [section] of treasureManager.getTreasures()) {
      // Apply secret filtering.
      if (this.currentFilter === null || this.currentFilter === "" || section.includes(this.currentFilter)) {
        this.uiTreasuresListComboBox.AddItem(section, index);
        index += 1;
      }
    }

    this.uiTreasureInfoLabel.TextControl().SetText(this.getTreasureDescription(this.currentSection));
  }

  /**
   * todo;
   */
  public getTreasureDescription(section: Optional<TSection>): TLabel {
    const treasureManager: TreasureManager = TreasureManager.getInstance();

    if (section !== null) {
      const treasure: ITreasureDescriptor = treasureManager.getTreasures().get(section);

      let totalItems: TCount = 0;
      let base: TLabel = `given: ${treasure.given} | checked: ${treasure.checked} | refreshing: ${
        treasure.refreshing !== null
      } | empty: ${treasure.refreshing !== null} | items remain: ${treasure.itemsToFindRemain} | `;

      if (table.size(treasure.items) > 0) {
        for (const [section, list] of treasure.items) {
          base += string.format("%s : %s | ", section, table.size(list));

          for (const [, itemDescriptor] of list) {
            totalItems += itemDescriptor.count;
          }
        }
      }

      base += string.format("total items: %s | cost: %s", totalItems, treasure.cost);

      return base;
    }

    return "";
  }

  /**
   * todo;
   */
  public onSelectedTreasureChange(): void {
    this.currentSection = this.uiTreasuresListComboBox.GetText();
    this.uiTreasureInfoLabel.TextControl().SetText(this.currentFilter);
  }

  /**
   * todo;
   */
  public onSelectedTreasureFilterChange(): void {
    this.currentSection = null;
    this.currentFilter = this.uiTreasuresListEditBox.GetText();
    this.uiTreasuresListComboBox.SetCurrentID(0);
    this.initializeState();
  }

  /**
   * todo;
   */
  public onTeleportToTreasureClicked(): void {
    logger.info("Teleport to treasure");
  }

  /**
   * Give all treasures for the actor.
   */
  public onGiveAllTreasuresButtonClicked(): void {
    logger.info("onGiveAllTreasuresButtonClicked");

    if (isGameStarted()) {
      TreasureManager.getInstance().giveActorAllTreasureCoordinates();
    }
  }

  /**
   * Give random treasures for the actor.
   */
  public onGiveRandomTreasuresButtonClicked(): void {
    logger.info("onGiveRandomTreasuresButtonClicked");

    if (isGameStarted()) {
      TreasureManager.getInstance().giveActorRandomTreasureCoordinates();
    }
  }

  /**
   * Reset all treasures.
   */
  public onResetAllTreasuresButtonClicked(): void {
    logger.info("onResetAllTreasuresButtonClicked");

    if (isGameStarted()) {
      // todo;
    }
  }

  /**
   * Give specific treasures for the actor.
   */
  public onGiveSpecificTreasureButtonClicked(): void {
    logger.info("onGiveSpecificTreasureButtonClicked");
  }

  /**
   * Reset specific treasure.
   */
  public onResetSpecificTreasuresButtonClicked(): void {
    logger.info("onResetSpecificTreasuresButtonClicked");
  }
}

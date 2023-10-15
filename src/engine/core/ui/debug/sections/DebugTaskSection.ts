import {
  CUI3tButton,
  CUICheckButton,
  CUIListBox,
  CUIListBoxItem,
  CUIStatic,
  game,
  LuabindClass,
  ui_events,
} from "xray16";

import { registry } from "@/engine/core/database";
import { TaskManager } from "@/engine/core/managers/tasks";
import { TASK_MANAGER_CONFIG_LTX } from "@/engine/core/managers/tasks/TaskConfig";
import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { isGameStarted } from "@/engine/core/utils/game";
import { parseConditionsList, pickSectionFromCondList, readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EElementType, initializeElement, resolveXmlFile } from "@/engine/core/utils/ui";
import { Optional, TCount, TLabel, TName, TPath, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "menu\\debug\\DebugTaskSection.component";

/**
 * Debugging of game objects registry / database.
 */
@LuabindClass()
export class DebugTaskSection extends AbstractDebugSection {
  public uiGiveTaskButton!: CUI3tButton;
  public uiTaskCountLabel!: CUIStatic;
  public uiTaskFilterActive!: CUICheckButton;
  public uiTaskList!: CUIListBox;

  public selectedTaskId: Optional<TStringId> = null;
  public filterIsActive: boolean = false;

  public initializeControls(): void {
    resolveXmlFile(base, this.xml);

    initializeElement(this.xml, "task_list_frame", EElementType.FRAME, this);

    this.uiTaskCountLabel = initializeElement(this.xml, "task_filter_count", EElementType.STATIC, this);

    this.uiGiveTaskButton = initializeElement(this.xml, "give_task", EElementType.BUTTON, this, {
      context: this.owner,
      [ui_events.BUTTON_CLICKED]: () => this.onGiveTask(),
    });

    this.uiTaskFilterActive = initializeElement(this.xml, "task_filter_active", EElementType.CHECK_BUTTON, this, {
      context: this.owner,
      [ui_events.CHECK_BUTTON_RESET]: () => this.onToggleFilterActive(),
      [ui_events.CHECK_BUTTON_SET]: () => this.onToggleFilterActive(),
    });

    this.uiTaskList = initializeElement(this.xml, "task_list", EElementType.LIST_BOX, this, {
      context: this.owner,
      [ui_events.LIST_ITEM_SELECT]: () => this.onSelectedObjectChange(),
    });
  }

  public override initializeState(): void {
    this.uiTaskFilterActive.SetCheck(this.filterIsActive);

    const taskManager: TaskManager = TaskManager.getInstance();

    if (isGameStarted()) {
      let total: TCount = 0;

      this.uiTaskList.Clear();

      TASK_MANAGER_CONFIG_LTX.section_for_each((it) => {
        total += 1;

        let isValid: boolean = true;
        const title: TName = readIniString(TASK_MANAGER_CONFIG_LTX, it, "title", false, null, "?");
        const titleLabel: TLabel = game.translate_string(
          pickSectionFromCondList(registry.actor, null, parseConditionsList(title)) ?? ""
        );

        if (this.filterIsActive && !taskManager.isTaskActive(it)) {
          isValid = false;
        }

        if (isValid) {
          this.uiTaskList.AddTextItem(string.format("%s | %s", it, titleLabel));
        }
      });

      this.uiTaskCountLabel.SetText(string.format("Total: %s", total));
    }
  }

  public onSelectedObjectChange(): void {
    const selected: Optional<CUIListBoxItem> = this.uiTaskList.GetSelectedItem();

    if (selected) {
      this.selectedTaskId = string.trim(selected.GetTextItem().GetText().split("|")[0]);
    } else {
      this.selectedTaskId = null;
    }
  }

  public onGiveTask(): void {
    if (this.selectedTaskId) {
      logger.info("Give task:", this.selectedTaskId);
      TaskManager.getInstance().giveTask(this.selectedTaskId);
    } else {
      logger.info("No task to give");
    }
  }

  public onToggleFilterActive(): void {
    this.filterIsActive = this.uiTaskFilterActive.GetCheck();
    this.initializeState();
  }
}

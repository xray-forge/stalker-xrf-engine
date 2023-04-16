import {
  level,
  LuabindClass,
  ui_events,
  XR_CUI3tButton,
  XR_CUICheckButton,
  XR_CUIStatic,
  XR_game_object,
} from "xray16";

import { DebugManager } from "@/engine/core/managers/debug/DebugManager";
import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { isGameStarted } from "@/engine/core/utils/alife";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { NIL } from "@/engine/lib/constants/words";
import { Optional, TPath } from "@/engine/lib/types";

const base: TPath = "menu\\debug\\DebugObjectSection.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class DebugObjectSection extends AbstractDebugSection {
  public nearestStalkerLabel!: XR_CUIStatic;
  public targetStalkerLabel!: XR_CUIStatic;

  public useTargetCheck!: XR_CUICheckButton;
  public useTargetCheckLabel!: XR_CUIStatic;
  public logPlannerStateButton!: XR_CUI3tButton;
  public logInventoryStateButton!: XR_CUI3tButton;
  public logRelationsStateButton!: XR_CUI3tButton;
  public logStateManagerReportButton!: XR_CUI3tButton;

  public initializeControls(): void {
    resolveXmlFile(base, this.xml);

    this.nearestStalkerLabel = this.xml.InitStatic("nearest_stalker_label", this);
    this.targetStalkerLabel = this.xml.InitStatic("target_stalker_label", this);
    this.useTargetCheckLabel = this.xml.InitStatic("use_target_object_label", this);
    this.useTargetCheck = this.xml.InitCheck("use_target_object_check", this);

    this.logPlannerStateButton = this.xml.Init3tButton("log_planner_state", this);
    this.logInventoryStateButton = this.xml.Init3tButton("log_inventory_state", this);
    this.logRelationsStateButton = this.xml.Init3tButton("log_relations_state", this);
    this.logStateManagerReportButton = this.xml.Init3tButton("log_state_manager_state", this);

    this.owner.Register(this.useTargetCheck, "use_target_object_check");
    this.owner.Register(this.logPlannerStateButton, "log_planner_state");
    this.owner.Register(this.logInventoryStateButton, "log_inventory_state");
    this.owner.Register(this.logRelationsStateButton, "log_relations_state");
    this.owner.Register(this.logStateManagerReportButton, "log_state_manager_state");
  }

  public initializeCallBacks(): void {
    this.owner.AddCallback("log_planner_state", ui_events.BUTTON_CLICKED, () => this.onPrintActionPlannerState(), this);
    this.owner.AddCallback("log_inventory_state", ui_events.BUTTON_CLICKED, () => this.onPrintInventoryState(), this);
    this.owner.AddCallback("log_relations_state", ui_events.BUTTON_CLICKED, () => this.onPrintRelationsState(), this);
    this.owner.AddCallback(
      "log_state_manager_state",
      ui_events.BUTTON_CLICKED,
      () => this.onPrintStateManagerReport(),
      this
    );
  }

  public initializeState(): void {
    if (isGameStarted()) {
      const debugManager: DebugManager = DebugManager.getInstance();
      const nearestStalker: Optional<XR_game_object> = debugManager.getNearestClientObject();
      const targetStalker: Optional<XR_game_object> = level.get_target_obj();

      this.nearestStalkerLabel.SetText("Nearest: " + (nearestStalker ? nearestStalker.name() : NIL));
      this.targetStalkerLabel.SetText("Target: " + (targetStalker ? targetStalker.name() : NIL));
    } else {
      this.nearestStalkerLabel.SetText("Nearest: " + NIL);
      this.targetStalkerLabel.SetText("Target: " + NIL);
    }

    this.useTargetCheck.SetCheck(true);
  }

  public onPrintActionPlannerState(): void {
    if (!isGameStarted()) {
      return logger.info("Cannot print while game is not started");
    }

    const targetObject: Optional<XR_game_object> = this.getCurrentObject();

    if (targetObject) {
      DebugManager.getInstance().logObjectPlannerState(targetObject);
    } else {
      logger.info("No object found for action state print");
    }
  }

  public onPrintInventoryState(): void {
    if (!isGameStarted()) {
      return logger.info("Cannot print while game is not started");
    }

    const targetObject: Optional<XR_game_object> = this.getCurrentObject();

    if (targetObject) {
      DebugManager.getInstance().logObjectInventoryItems(targetObject);
    } else {
      logger.info("No object found for inventory state print");
    }
  }

  public onPrintRelationsState(): void {
    if (!isGameStarted()) {
      return logger.info("Cannot print while game is not started");
    }

    const targetObject: Optional<XR_game_object> = this.getCurrentObject();

    if (targetObject) {
      DebugManager.getInstance().logObjectRelations(targetObject);
    } else {
      logger.info("No object found for relations state print");
    }
  }

  public onPrintStateManagerReport(): void {
    if (!isGameStarted()) {
      return logger.info("Cannot print while game is not started");
    }

    const targetObject: Optional<XR_game_object> = this.getCurrentObject();

    if (targetObject) {
      DebugManager.getInstance().logObjectStateManager(targetObject);
    } else {
      logger.info("No object found for state manager report");
    }
  }

  public getCurrentObject(): Optional<XR_game_object> {
    return this.useTargetCheck.GetCheck()
      ? level.get_target_obj()
      : DebugManager.getInstance().getNearestClientObject();
  }
}

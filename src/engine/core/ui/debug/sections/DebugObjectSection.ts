import { CUI3tButton, CUICheckButton, CUIStatic, level, LuabindClass, ui_events } from "xray16";

import { registry } from "@/engine/core/database";
import { DebugManager } from "@/engine/core/managers/debug/DebugManager";
import { Squad } from "@/engine/core/objects";
import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { isGameStarted } from "@/engine/core/utils/alife";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSquad } from "@/engine/core/utils/object";
import { getObjectsRelationSafe, getSquadRelationToActor, setObjectsRelation } from "@/engine/core/utils/relation";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { ERelation } from "@/engine/lib/constants/relations";
import { NIL } from "@/engine/lib/constants/words";
import { ClientObject, Optional, TPath } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "menu\\debug\\DebugObjectSection.component";

/**
 * todo;
 */
@LuabindClass()
export class DebugObjectSection extends AbstractDebugSection {
  public nearestStalkerLabel!: CUIStatic;
  public targetStalkerLabel!: CUIStatic;
  public targetStalkerRelationLabel!: CUIStatic;
  public targetStalkerSquadRelationLabel!: CUIStatic;

  public useTargetCheck!: CUICheckButton;
  public useTargetCheckLabel!: CUIStatic;
  public logPlannerStateButton!: CUI3tButton;
  public logInventoryStateButton!: CUI3tButton;
  public logRelationsStateButton!: CUI3tButton;
  public logStateManagerReportButton!: CUI3tButton;
  public logStateButton!: CUI3tButton;

  public setFriendButton!: CUI3tButton;
  public setNeutralButton!: CUI3tButton;
  public setEnemyButton!: CUI3tButton;

  public initializeControls(): void {
    resolveXmlFile(base, this.xml);

    this.nearestStalkerLabel = this.xml.InitStatic("nearest_stalker_label", this);
    this.targetStalkerLabel = this.xml.InitStatic("target_stalker_label", this);
    this.targetStalkerRelationLabel = this.xml.InitStatic("target_stalker_relation_label", this);
    this.targetStalkerSquadRelationLabel = this.xml.InitStatic("target_stalker_squad_relation_label", this);
    this.useTargetCheckLabel = this.xml.InitStatic("use_target_object_label", this);
    this.useTargetCheck = this.xml.InitCheck("use_target_object_check", this);

    this.logPlannerStateButton = this.xml.Init3tButton("log_planner_state", this);
    this.logInventoryStateButton = this.xml.Init3tButton("log_inventory_state", this);
    this.logRelationsStateButton = this.xml.Init3tButton("log_relations_state", this);
    this.logStateManagerReportButton = this.xml.Init3tButton("log_state_manager_state", this);
    this.logStateButton = this.xml.Init3tButton("log_state", this);

    this.setFriendButton = this.xml.Init3tButton("set_friend_button", this);
    this.setNeutralButton = this.xml.Init3tButton("set_neutral_button", this);
    this.setEnemyButton = this.xml.Init3tButton("set_enemy_button", this);

    this.owner.Register(this.useTargetCheck, "use_target_object_check");
    this.owner.Register(this.logPlannerStateButton, "log_planner_state");
    this.owner.Register(this.logInventoryStateButton, "log_inventory_state");
    this.owner.Register(this.logRelationsStateButton, "log_relations_state");
    this.owner.Register(this.logStateManagerReportButton, "log_state_manager_state");
    this.owner.Register(this.logStateButton, "log_state");

    this.owner.Register(this.setFriendButton, "set_friend_button");
    this.owner.Register(this.setNeutralButton, "set_neutral_button");
    this.owner.Register(this.setEnemyButton, "set_enemy_button");
  }

  public initializeCallBacks(): void {
    this.owner.AddCallback("log_state", ui_events.BUTTON_CLICKED, () => this.onPrintState(), this);
    this.owner.AddCallback("log_planner_state", ui_events.BUTTON_CLICKED, () => this.onPrintActionPlannerState(), this);
    this.owner.AddCallback("log_inventory_state", ui_events.BUTTON_CLICKED, () => this.onPrintInventoryState(), this);
    this.owner.AddCallback("log_relations_state", ui_events.BUTTON_CLICKED, () => this.onPrintRelationsState(), this);
    this.owner.AddCallback(
      "log_state_manager_state",
      ui_events.BUTTON_CLICKED,
      () => this.onPrintStateManagerReport(),
      this
    );

    this.owner.AddCallback(
      "set_friend_button",
      ui_events.BUTTON_CLICKED,
      () => this.onSetRelation(ERelation.FRIEND),
      this
    );
    this.owner.AddCallback(
      "set_neutral_button",
      ui_events.BUTTON_CLICKED,
      () => this.onSetRelation(ERelation.NEUTRAL),
      this
    );
    this.owner.AddCallback(
      "set_enemy_button",
      ui_events.BUTTON_CLICKED,
      () => this.onSetRelation(ERelation.ENEMY),
      this
    );
  }

  public initializeState(): void {
    if (isGameStarted()) {
      const debugManager: DebugManager = DebugManager.getInstance();
      const nearestStalker: Optional<ClientObject> = debugManager.getNearestClientObject();
      const targetStalker: Optional<ClientObject> = level.get_target_obj();
      const squad: Optional<Squad> = targetStalker ? getObjectSquad(targetStalker) : null;

      this.nearestStalkerLabel.SetText("Nearest: " + (nearestStalker ? nearestStalker.name() : NIL));
      this.targetStalkerLabel.SetText("Target: " + (targetStalker ? targetStalker.name() : NIL));
      this.targetStalkerRelationLabel.SetText(
        "object relation: " + getObjectsRelationSafe(targetStalker, registry.actor)
      );
      this.targetStalkerSquadRelationLabel.SetText("squad relation: " + (squad ? getSquadRelationToActor(squad) : NIL));
    } else {
      this.nearestStalkerLabel.SetText("Nearest: " + NIL);
      this.targetStalkerLabel.SetText("Target: " + NIL);
      this.targetStalkerRelationLabel.SetText("object relation: " + NIL);
      this.targetStalkerSquadRelationLabel.SetText("squad relation: " + NIL);
    }

    this.useTargetCheck.SetCheck(true);
  }

  public onPrintActionPlannerState(): void {
    if (!isGameStarted()) {
      return logger.info("Cannot print while game is not started");
    }

    const targetObject: Optional<ClientObject> = this.getCurrentObject();

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

    const targetObject: Optional<ClientObject> = this.getCurrentObject();

    if (targetObject) {
      DebugManager.getInstance().logObjectInventoryItems(targetObject);
    } else {
      logger.info("No object found for inventory state print");
    }
  }

  public onPrintState(): void {
    if (!isGameStarted()) {
      return logger.info("Cannot print while game is not started");
    }

    const targetObject: Optional<ClientObject> = this.getCurrentObject();

    if (targetObject) {
      DebugManager.getInstance().logObjectState(targetObject);
    } else {
      logger.info("No object found for scheme state print");
    }
  }

  public onPrintRelationsState(): void {
    if (!isGameStarted()) {
      return logger.info("Cannot print while game is not started");
    }

    const targetObject: Optional<ClientObject> = this.getCurrentObject();

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

    const targetObject: Optional<ClientObject> = this.getCurrentObject();

    if (targetObject) {
      DebugManager.getInstance().logObjectStateManager(targetObject);
    } else {
      logger.info("No object found for state manager report");
    }
  }

  public onSetRelation(relation: ERelation): void {
    if (!isGameStarted()) {
      return logger.info("Cannot set relation while game is not started");
    }

    const targetObject: Optional<ClientObject> = this.getCurrentObject();

    if (targetObject) {
      logger.info("Set actor relation for:", targetObject.name(), relation);
      setObjectsRelation(targetObject, registry.actor, relation);
      this.initializeState();
    } else {
      logger.info("No object found for relation change");
    }
  }

  public getCurrentObject(): Optional<ClientObject> {
    return this.useTargetCheck.GetCheck()
      ? level.get_target_obj()
      : DebugManager.getInstance().getNearestClientObject();
  }
}

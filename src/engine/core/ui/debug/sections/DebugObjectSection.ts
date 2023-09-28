import { CUI3tButton, CUICheckButton, CUIStatic, level, LuabindClass, ui_events } from "xray16";

import { registry } from "@/engine/core/database";
import { DebugManager } from "@/engine/core/managers/debug/DebugManager";
import type { Squad } from "@/engine/core/objects/server/squad";
import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { isGameStarted } from "@/engine/core/utils/game";
import { LuaLogger } from "@/engine/core/utils/logging";
import { setObjectWounded } from "@/engine/core/utils/object";
import { getNearestClientObject } from "@/engine/core/utils/object/object_find";
import {
  ERelation,
  getObjectsRelationSafe,
  getSquadMembersRelationToActorSafe,
  setClientObjectRelation,
} from "@/engine/core/utils/relation";
import { getObjectSquad } from "@/engine/core/utils/squad";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { NIL } from "@/engine/lib/constants/words";
import { ClientObject, Optional, TPath } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "menu\\debug\\DebugObjectSection.component";

/**
 * todo;
 */
@LuabindClass()
export class DebugObjectSection extends AbstractDebugSection {
  public uiNearestStalkerLabel!: CUIStatic;
  public uiTargetStalkerLabel!: CUIStatic;
  public uiTargetStalkerRelationLabel!: CUIStatic;
  public uiTargetStalkerSquadRelationLabel!: CUIStatic;
  public uiTargetStalkerHealthLabel!: CUIStatic;

  public uiUseTargetCheck!: CUICheckButton;
  public uiUseTargetCheckLabel!: CUIStatic;
  public uiLogPlannerStateButton!: CUI3tButton;
  public uiLogInventoryStateButton!: CUI3tButton;
  public uiLogRelationsStateButton!: CUI3tButton;
  public uiLogStateManagerReportButton!: CUI3tButton;
  public uiLogStateButton!: CUI3tButton;

  public uiSetFriendButton!: CUI3tButton;
  public uiSetNeutralButton!: CUI3tButton;
  public uiSetEnemyButton!: CUI3tButton;

  public uiKillButton!: CUI3tButton;
  public uiSetWoundedButton!: CUI3tButton;

  public initializeControls(): void {
    resolveXmlFile(base, this.xml);

    this.uiNearestStalkerLabel = this.xml.InitStatic("nearest_stalker_label", this);
    this.uiTargetStalkerLabel = this.xml.InitStatic("target_stalker_label", this);
    this.uiTargetStalkerRelationLabel = this.xml.InitStatic("target_stalker_relation_label", this);
    this.uiTargetStalkerSquadRelationLabel = this.xml.InitStatic("target_stalker_squad_relation_label", this);
    this.uiTargetStalkerHealthLabel = this.xml.InitStatic("target_stalker_health_label", this);
    this.uiUseTargetCheckLabel = this.xml.InitStatic("use_target_object_label", this);
    this.uiUseTargetCheck = this.xml.InitCheck("use_target_object_check", this);

    this.uiLogPlannerStateButton = this.xml.Init3tButton("log_planner_state", this);
    this.uiLogInventoryStateButton = this.xml.Init3tButton("log_inventory_state", this);
    this.uiLogRelationsStateButton = this.xml.Init3tButton("log_relations_state", this);
    this.uiLogStateManagerReportButton = this.xml.Init3tButton("log_state_manager_state", this);
    this.uiLogStateButton = this.xml.Init3tButton("log_state", this);

    this.uiSetFriendButton = this.xml.Init3tButton("set_friend_button", this);
    this.uiSetNeutralButton = this.xml.Init3tButton("set_neutral_button", this);
    this.uiSetEnemyButton = this.xml.Init3tButton("set_enemy_button", this);

    this.uiKillButton = this.xml.Init3tButton("kill_button", this);
    this.uiSetWoundedButton = this.xml.Init3tButton("set_wounded_button", this);

    this.owner.Register(this.uiUseTargetCheck, "use_target_object_check");
    this.owner.Register(this.uiLogPlannerStateButton, "log_planner_state");
    this.owner.Register(this.uiLogInventoryStateButton, "log_inventory_state");
    this.owner.Register(this.uiLogRelationsStateButton, "log_relations_state");
    this.owner.Register(this.uiLogStateManagerReportButton, "log_state_manager_state");
    this.owner.Register(this.uiLogStateButton, "log_state");

    this.owner.Register(this.uiSetFriendButton, "set_friend_button");
    this.owner.Register(this.uiSetNeutralButton, "set_neutral_button");
    this.owner.Register(this.uiSetEnemyButton, "set_enemy_button");
    this.owner.Register(this.uiKillButton, "kill_button");
    this.owner.Register(this.uiSetWoundedButton, "set_wounded_button");
  }

  public override initializeCallBacks(): void {
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
    this.owner.AddCallback("kill_button", ui_events.BUTTON_CLICKED, () => this.onKillObject(), this);
    this.owner.AddCallback("set_wounded_button", ui_events.BUTTON_CLICKED, () => this.onSetWoundedObject(), this);
  }

  public override initializeState(): void {
    if (isGameStarted()) {
      const nearestStalker: Optional<ClientObject> = getNearestClientObject();
      const targetStalker: Optional<ClientObject> = level.get_target_obj();
      const squad: Optional<Squad> = targetStalker ? getObjectSquad(targetStalker) : null;

      this.uiNearestStalkerLabel.SetText("Nearest: " + (nearestStalker ? nearestStalker.name() : NIL));
      this.uiTargetStalkerLabel.SetText("Target: " + (targetStalker ? targetStalker.name() : NIL));
      this.uiTargetStalkerRelationLabel.SetText(
        "object relation: " + getObjectsRelationSafe(targetStalker, registry.actor)
      );
      this.uiTargetStalkerSquadRelationLabel.SetText(
        "squad relation: " + (squad ? getSquadMembersRelationToActorSafe(squad) : NIL)
      );
      this.uiTargetStalkerHealthLabel.SetText("health: " + (targetStalker ? targetStalker.health : NIL));
    } else {
      this.uiNearestStalkerLabel.SetText("Nearest: " + NIL);
      this.uiTargetStalkerLabel.SetText("Target: " + NIL);
      this.uiTargetStalkerRelationLabel.SetText("object relation: " + NIL);
      this.uiTargetStalkerSquadRelationLabel.SetText("squad relation: " + NIL);
      this.uiTargetStalkerHealthLabel.SetText("health: " + NIL);
    }

    this.uiUseTargetCheck.SetCheck(true);
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
      setClientObjectRelation(targetObject, registry.actor, relation);
      this.initializeState();
    } else {
      logger.info("No object found for relation change");
    }
  }

  public onKillObject(): void {
    if (!isGameStarted()) {
      return logger.info("Cannot kill object while game is not started");
    }

    const targetObject: Optional<ClientObject> = this.getCurrentObject();

    if (targetObject) {
      logger.info("Kill object:", targetObject.name());
      targetObject.kill(targetObject);
    } else {
      logger.info("No object found for killing");
    }
  }

  public onSetWoundedObject(): void {
    if (!isGameStarted()) {
      return logger.info("Cannot set wounded object while game is not started");
    }

    const targetObject: Optional<ClientObject> = this.getCurrentObject();

    if (targetObject) {
      logger.info("Set wounded object:", targetObject.name());

      setObjectWounded(targetObject);
    } else {
      logger.info("No object found for wounding");
    }
  }

  public getCurrentObject(): Optional<ClientObject> {
    return this.uiUseTargetCheck.GetCheck() ? level.get_target_obj() : getNearestClientObject();
  }
}

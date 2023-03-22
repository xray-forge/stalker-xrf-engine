import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme, EActionId, EEvaluatorId } from "@/engine/core/schemes";
import { ActionCompanionActivity } from "@/engine/core/schemes/companion/actions";
import { EvaluatorNeedCompanion } from "@/engine/core/schemes/companion/evaluators";
import { ISchemeCompanionState } from "@/engine/core/schemes/companion/ISchemeCompanionState";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { addCommonPrecondition } from "@/engine/core/utils/scheme";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeCompanion extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.COMPANION;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo: Description.
   */
  public static override activate(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    additional: string
  ): void {
    const state: ISchemeCompanionState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.behavior = 0; // beh_walk_simple
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCompanionState
  ): void {
    const operators = {
      action_companion: EActionId.zmey_companion_base + 1,
    };
    const properties = {
      need_companion: EEvaluatorId.zmey_companion_base + 1,
      state_mgr_logic_active: EEvaluatorId.state_mgr + 4,
    };

    const actionPlanner: XR_action_planner = object.motivation_action_manager();

    actionPlanner.add_evaluator(properties.need_companion, new EvaluatorNeedCompanion(state));

    const actionCompanionActivity: ActionCompanionActivity = new ActionCompanionActivity(state);

    actionCompanionActivity.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionCompanionActivity.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionCompanionActivity.add_precondition(new world_property(properties.need_companion, true));
    addCommonPrecondition(actionCompanionActivity);
    actionCompanionActivity.add_effect(new world_property(properties.need_companion, false));
    actionCompanionActivity.add_effect(new world_property(properties.state_mgr_logic_active, false));
    actionPlanner.add_action(operators.action_companion, actionCompanionActivity);

    SchemeCompanion.subscribe(object, state, actionCompanionActivity);

    actionPlanner.action(EActionId.alife).add_precondition(new world_property(properties.need_companion, false));
  }
}

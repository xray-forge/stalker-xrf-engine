import {
  cast_planner,
  stalker_ids,
  world_property,
  XR_action_base,
  XR_action_planner,
  XR_game_object,
  XR_ini_file,
} from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { ActionReachTaskLocation } from "@/mod/scripts/core/schemes/reach_task/actions";
import { EvaluatorReachedTaskLocation } from "@/mod/scripts/core/schemes/reach_task/evaluators";
import { ISchemeReachTaskState } from "@/mod/scripts/core/schemes/reach_task/ISchemeReachTaskState";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(FILENAME);

/**
 * todo;
 */
export class SchemeReachTask extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.REACH_TASK;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeReachTaskState
  ): void {
    const manager: XR_action_planner = object.motivation_action_manager();
    const alifeAction: XR_action_base = manager.action(stalker_ids.action_alife_planner);
    const alifeActionPlanner: XR_action_planner = cast_planner(alifeAction);
    const newAction: XR_action_base = alifeActionPlanner.action(stalker_ids.action_smart_terrain_task);

    subscribeActionForEvents(object, state, newAction);
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme): void {
    const state: ISchemeReachTaskState = AbstractScheme.assignStateAndBind(object, ini, scheme, null);
  }

  /**
   * todo;
   */
  public static addReachTaskSchemeAction(object: XR_game_object): void {
    const actionPlanner: XR_action_planner = object.motivation_action_manager();
    const alifeAction: XR_action_base = actionPlanner.action(stalker_ids.action_alife_planner);
    const alifeActionPlanner: XR_action_planner = cast_planner(alifeAction);

    alifeActionPlanner.remove_evaluator(stalker_ids.property_smart_terrain_task);
    alifeActionPlanner.add_evaluator(stalker_ids.property_smart_terrain_task, new EvaluatorReachedTaskLocation());
    alifeActionPlanner.remove_action(stalker_ids.action_smart_terrain_task);

    const reachTaskAction: ActionReachTaskLocation = new ActionReachTaskLocation();

    reachTaskAction.add_precondition(new world_property(stalker_ids.property_alife, true));
    reachTaskAction.add_precondition(new world_property(stalker_ids.property_smart_terrain_task, true));
    reachTaskAction.add_effect(new world_property(stalker_ids.property_smart_terrain_task, false));

    alifeActionPlanner.add_action(stalker_ids.action_smart_terrain_task, reachTaskAction);
  }
}

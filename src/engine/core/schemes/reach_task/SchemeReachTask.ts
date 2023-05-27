import { cast_planner, stalker_ids, world_property } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ActionReachTaskLocation } from "@/engine/core/schemes/reach_task/actions";
import { EvaluatorReachedTaskLocation } from "@/engine/core/schemes/reach_task/evaluators";
import { ISchemeReachTaskState } from "@/engine/core/schemes/reach_task/ISchemeReachTaskState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ActionBase, ActionPlanner, ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeReachTask extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.REACH_TASK;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo: Description.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme): void {
    const state: ISchemeReachTaskState = AbstractScheme.assign(object, ini, scheme, null);
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeReachTaskState
  ): void {
    const manager: ActionPlanner = object.motivation_action_manager();
    const alifeAction: ActionBase = manager.action(stalker_ids.action_alife_planner);
    const alifeActionPlanner: ActionPlanner = cast_planner(alifeAction);
    const newAction: ActionBase = alifeActionPlanner.action(stalker_ids.action_smart_terrain_task);

    SchemeReachTask.subscribe(object, state, newAction);
  }

  /**
   * todo: Description.
   */
  public static addReachTaskSchemeAction(object: ClientObject): void {
    const actionPlanner: ActionPlanner = object.motivation_action_manager();
    const alifeAction: ActionBase = actionPlanner.action(stalker_ids.action_alife_planner);
    const alifeActionPlanner: ActionPlanner = cast_planner(alifeAction);

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

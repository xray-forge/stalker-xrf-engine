import { cast_planner, world_property } from "xray16";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { AbstractScheme } from "@/engine/core/ai/scheme/AbstractScheme";
import { ActionReachTaskLocation } from "@/engine/core/schemes/stalker/reach_task/actions";
import { EvaluatorReachedTaskLocation } from "@/engine/core/schemes/stalker/reach_task/evaluators";
import { ISchemeReachTaskState } from "@/engine/core/schemes/stalker/reach_task/reach_task_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ActionPlanner, EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme defining logics of stalker when reaching smart terrain task.
 * It can be going to another squad, smart terrain or actor.
 */
export class SchemeReachTask extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.REACH_TASK;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(object: GameObject, ini: IniFile, scheme: EScheme): ISchemeReachTaskState {
    return AbstractScheme.assign(object, ini, scheme, null);
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeReachTaskState
  ): void {
    const planner: ActionPlanner = object.motivation_action_manager();
    const alifePlanner: ActionPlanner = cast_planner(planner.action(EActionId.ALIFE));

    const smartTerrainTaskAction: ActionReachTaskLocation = alifePlanner.action(
      EActionId.SMART_TERRAIN_TASK
    ) as ActionReachTaskLocation;

    AbstractScheme.subscribe(state, smartTerrainTaskAction);
  }

  /**
   * todo: Description.
   * todo: generic init method?
   */
  public static setup(object: GameObject): void {
    const planner: ActionPlanner = object.motivation_action_manager();
    const alifePlanner: ActionPlanner = cast_planner(planner.action(EActionId.ALIFE));

    alifePlanner.remove_evaluator(EEvaluatorId.SMART_TERRAIN_TASK);
    alifePlanner.add_evaluator(EEvaluatorId.SMART_TERRAIN_TASK, new EvaluatorReachedTaskLocation());
    alifePlanner.remove_action(EActionId.SMART_TERRAIN_TASK);

    const reachTaskAction: ActionReachTaskLocation = new ActionReachTaskLocation();

    reachTaskAction.add_precondition(new world_property(EEvaluatorId.ALIFE, true));
    reachTaskAction.add_precondition(new world_property(EEvaluatorId.SMART_TERRAIN_TASK, true));
    reachTaskAction.add_effect(new world_property(EEvaluatorId.SMART_TERRAIN_TASK, false));

    alifePlanner.add_action(EActionId.SMART_TERRAIN_TASK, reachTaskAction);
  }
}

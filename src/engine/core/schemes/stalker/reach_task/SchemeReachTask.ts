import { cast_planner, world_property } from "xray16";

import { AbstractScheme } from "@/engine/core/objects/ai/scheme/AbstractScheme";
import { EActionId, EEvaluatorId } from "@/engine/core/objects/ai/types";
import { ActionReachTaskLocation } from "@/engine/core/schemes/stalker/reach_task/actions";
import { EvaluatorReachedTaskLocation } from "@/engine/core/schemes/stalker/reach_task/evaluators";
import { ISchemeReachTaskState } from "@/engine/core/schemes/stalker/reach_task/ISchemeReachTaskState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ActionBase, ActionPlanner, ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeReachTask extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.REACH_TASK;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme): ISchemeReachTaskState {
    return AbstractScheme.assign(object, ini, scheme, null);
  }

  public static override add(
    object: ClientObject,
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

    AbstractScheme.subscribe(object, state, smartTerrainTaskAction);
  }

  /**
   * todo: Description.
   * todo: generic init method?
   */
  public static setup(object: ClientObject): void {
    const actionPlanner: ActionPlanner = object.motivation_action_manager();
    const alifeAction: ActionBase = actionPlanner.action(EActionId.ALIFE);
    const alifeActionPlanner: ActionPlanner = cast_planner(alifeAction);

    alifeActionPlanner.remove_evaluator(EEvaluatorId.SMART_TERRAIN_TASK);
    alifeActionPlanner.add_evaluator(EEvaluatorId.SMART_TERRAIN_TASK, new EvaluatorReachedTaskLocation());
    alifeActionPlanner.remove_action(EActionId.SMART_TERRAIN_TASK);

    const reachTaskAction: ActionReachTaskLocation = new ActionReachTaskLocation();

    reachTaskAction.add_precondition(new world_property(EEvaluatorId.ALIFE, true));
    reachTaskAction.add_precondition(new world_property(EEvaluatorId.SMART_TERRAIN_TASK, true));
    reachTaskAction.add_effect(new world_property(EEvaluatorId.SMART_TERRAIN_TASK, false));

    alifeActionPlanner.add_action(EActionId.SMART_TERRAIN_TASK, reachTaskAction);
  }
}

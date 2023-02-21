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
import { IStoredObject } from "@/mod/scripts/core/database";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { ActionReachTaskLocation, IActionReachTaskLocation } from "@/mod/scripts/core/schemes/reach_task/actions";
import { EvaluatorReachedTaskLocation } from "@/mod/scripts/core/schemes/reach_task/evaluators";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeReachTask");

export class SchemeReachTask extends AbstractScheme {
  public static readonly SCHEME_SECTION: EScheme = EScheme.REACH_TASK;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    const manager: XR_action_planner = object.motivation_action_manager();
    const alife_action: XR_action_base = manager.action(stalker_ids.action_alife_planner);
    const alife_action_planner: XR_action_planner = cast_planner(alife_action);
    const new_action: XR_action_base = alife_action_planner.action(stalker_ids.action_smart_terrain_task);

    subscribeActionForEvents(object, state, new_action);
  }

  public static set_reach_task(npc: XR_game_object, ini: XR_ini_file, scheme: EScheme): void {
    assignStorageAndBind(npc, ini, scheme, null);
  }

  public static add_reach_task_action(npc: XR_game_object): void {
    const manager: XR_action_planner = npc.motivation_action_manager();
    const alife_action: XR_action_base = manager.action(stalker_ids.action_alife_planner);
    const alife_action_planner: XR_action_planner = cast_planner(alife_action);

    alife_action_planner.remove_evaluator(stalker_ids.property_smart_terrain_task);
    alife_action_planner.add_evaluator(
      stalker_ids.property_smart_terrain_task,
      create_xr_class_instance(EvaluatorReachedTaskLocation, EvaluatorReachedTaskLocation.__name)
    );
    alife_action_planner.remove_action(stalker_ids.action_smart_terrain_task);

    const reachTaskAction: IActionReachTaskLocation = create_xr_class_instance(
      ActionReachTaskLocation,
      ActionReachTaskLocation.__name
    );

    reachTaskAction.add_precondition(new world_property(stalker_ids.property_alife, true));
    reachTaskAction.add_precondition(new world_property(stalker_ids.property_smart_terrain_task, true));
    reachTaskAction.add_effect(new world_property(stalker_ids.property_smart_terrain_task, false));
    alife_action_planner.add_action(stalker_ids.action_smart_terrain_task, reachTaskAction);
  }
}

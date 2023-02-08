import {
  cast_planner,
  stalker_ids,
  world_property,
  XR_action_base,
  XR_action_planner,
  XR_game_object,
  XR_ini_file,
} from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { TScheme, TSection } from "@/mod/lib/types/configuration";
import { IStoredObject } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import {
  ActionReachTaskLocation,
  IActionReachTaskLocation,
} from "@/mod/scripts/core/logic/actions/ActionReachTaskLocation";
import { EvaluatorReachedTaskLocation } from "@/mod/scripts/core/logic/evaluators/EvaluatorReachedTaskLocation";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionSchemeReachTask");

export class ActionSchemeReachTask extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "reach_task";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    const manager: XR_action_planner = object.motivation_action_manager();
    const alife_action: XR_action_base = manager.action(stalker_ids.action_alife_planner);
    const alife_action_planner: XR_action_planner = cast_planner(alife_action);
    const new_action: XR_action_base = alife_action_planner.action(stalker_ids.action_smart_terrain_task);

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(object, state, new_action);
  }

  public static set_reach_task(npc: XR_game_object, ini: XR_ini_file, scheme: TScheme): void {
    const st = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(npc, ini, scheme);
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

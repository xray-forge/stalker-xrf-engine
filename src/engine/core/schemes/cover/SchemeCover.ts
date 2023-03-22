import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme, EActionId, EEvaluatorId } from "@/engine/core/schemes";
import { ActionBaseCover } from "@/engine/core/schemes/cover/actions";
import { EvaluatorNeedCover } from "@/engine/core/schemes/cover/evaluators";
import { ISchemeCoverState } from "@/engine/core/schemes/cover/ISchemeCoverState";
import { abort } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList } from "@/engine/core/utils/parse";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeCover extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.COVER;
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
    const state: ISchemeCoverState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.smart = readIniString(ini, section, "smart", false, "");
    state.anim = parseConditionsList(readIniString(ini, section, "anim", false, "", "hide"));
    state.sound_idle = readIniString(ini, section, "sound_idle", false, "");

    if (state.smart === null) {
      abort("There is no path_walk and smart in ActionCover.");
    }

    state.use_attack_direction = readIniBoolean(ini, section, "use_attack_direction", false, true);

    state.radius_min = readIniNumber(ini, section, "radius_min", false, 3);
    state.radius_max = readIniNumber(ini, section, "radius_max", false, 5);
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCoverState
  ): void {
    const operators = {
      action_cover: EActionId.stohe_cover_base + 1,
    };
    const properties = {
      event: EEvaluatorId.REACTION,
      need_cover: EEvaluatorId.stohe_cover_base + 1,
      state_mgr_logic_active: EEvaluatorId.state_mgr + 4,
    };

    const actionPlanner: XR_action_planner = object.motivation_action_manager();

    actionPlanner.add_evaluator(properties.need_cover, new EvaluatorNeedCover(state));

    const new_action: ActionBaseCover = new ActionBaseCover(state);

    new_action.add_precondition(new world_property(stalker_ids.property_alive, true));
    new_action.add_precondition(new world_property(stalker_ids.property_danger, false));
    new_action.add_precondition(new world_property(stalker_ids.property_enemy, false));
    new_action.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    new_action.add_precondition(new world_property(EEvaluatorId.sidor_wounded_base, false));
    new_action.add_precondition(new world_property(properties.need_cover, true));
    new_action.add_effect(new world_property(properties.need_cover, false));
    new_action.add_effect(new world_property(properties.state_mgr_logic_active, false));
    actionPlanner.add_action(operators.action_cover, new_action);

    SchemeCover.subscribe(object, state, new_action);

    actionPlanner.action(EActionId.alife).add_precondition(new world_property(properties.need_cover, false));
  }
}

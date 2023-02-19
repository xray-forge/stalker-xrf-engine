import { stalker_ids, world_property, XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/db";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { action_ids } from "@/mod/scripts/core/schemes/base/actions_id";
import { evaluators_id } from "@/mod/scripts/core/schemes/base/evaluators_id";
import { ActionSmartCoverActivity } from "@/mod/scripts/core/schemes/smartcover/actions/ActionSmartCoverActivity";
import {
  EvaluatorNeedSmartCover,
  EvaluatorUseSmartCoverInCombat,
} from "@/mod/scripts/core/schemes/smartcover/evaluators";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import {
  cfg_get_switch_conditions,
  getConfigBoolean,
  getConfigNumber,
  getConfigString,
} from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeSmartCover");

/**
 * todo;
 */
export class SchemeSmartCover extends AbstractScheme {
  public static readonly SCHEME_SECTION: EScheme = EScheme.SMARTCOVER;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    const operators = {
      action_smartcover: action_ids.smartcover_action,
      action_combat_smartcover: action_ids.smartcover_action + 2,
    };
    const properties = {
      need_smartcover: evaluators_id.smartcover_action + 1,
      use_smartcover_in_combat: evaluators_id.smartcover_action + 2,
      state_mgr_logic_active: evaluators_id.state_mgr + 4,
    };

    const manager = object.motivation_action_manager();

    manager.add_evaluator(
      properties.need_smartcover,
      create_xr_class_instance(EvaluatorNeedSmartCover, state, EvaluatorNeedSmartCover.__name)
    );
    manager.add_evaluator(
      properties.use_smartcover_in_combat,
      create_xr_class_instance(EvaluatorUseSmartCoverInCombat, state, EvaluatorUseSmartCoverInCombat.__name)
    );

    const new_action = create_xr_class_instance(ActionSmartCoverActivity, ActionSmartCoverActivity.__name, state);

    new_action.add_precondition(new world_property(stalker_ids.property_alive, true));
    new_action.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    new_action.add_precondition(new world_property(properties.need_smartcover, true));
    new_action.add_precondition(new world_property(properties.use_smartcover_in_combat, false));
    new_action.add_precondition(new world_property(stalker_ids.property_enemy, false));

    new_action.add_precondition(new world_property(evaluators_id.stohe_meet_base + 1, false));
    new_action.add_precondition(new world_property(evaluators_id.sidor_wounded_base, false));
    new_action.add_precondition(new world_property(evaluators_id.abuse_base, false));

    new_action.add_effect(new world_property(properties.need_smartcover, false));
    new_action.add_effect(new world_property(properties.state_mgr_logic_active, false));
    // --new_action.add_effect (new world_property(stalker_ids.property_danger,false))
    manager.add_action(operators.action_smartcover, new_action);

    subscribeActionForEvents(object, state, new_action);

    manager.action(action_ids.alife).add_precondition(new world_property(properties.need_smartcover, false));
    manager
      .action(stalker_ids.action_combat_planner)
      .add_precondition(new world_property(properties.use_smartcover_in_combat, false));
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    additional: string
  ): void {
    const st = assignStorageAndBind(object, ini, scheme, section);

    st.logic = cfg_get_switch_conditions(ini, section, object);
    st.cover_name = getConfigString(ini, section, "cover_name", object, false, "", "$script_id$_cover");
    st.loophole_name = getConfigString(ini, section, "loophole_name", object, false, "", null);
    st.cover_state = getConfigString(ini, section, "cover_state", object, false, "", "default_behaviour");
    st.target_enemy = getConfigString(ini, section, "target_enemy", object, false, "", null);
    st.target_path = getConfigString(ini, section, "target_path", object, false, "", "nil");
    st.idle_min_time = getConfigNumber(ini, section, "idle_min_time", object, false, 6);
    st.idle_max_time = getConfigNumber(ini, section, "idle_max_time", object, false, 10);
    st.lookout_min_time = getConfigNumber(ini, section, "lookout_min_time", object, false, 6);
    st.lookout_max_time = getConfigNumber(ini, section, "lookout_max_time", object, false, 10);
    st.exit_body_state = getConfigString(ini, section, "exit_body_state", object, false, "", "stand");
    st.use_precalc_cover = getConfigBoolean(ini, section, "use_precalc_cover", object, false, false);
    st.use_in_combat = getConfigBoolean(ini, section, "use_in_combat", object, false, false);
    st.weapon_type = getConfigString(ini, section, "weapon_type", object, false, false);
    st.moving = getConfigString(ini, section, "def_state_moving", object, false, "", "sneak");
    st.sound_idle = getConfigString(ini, section, "sound_idle", object, false, "");

    /**
     *   --[[
     *     if st.use_precalc_cover == true then
     *       const smart = sim_board.get_sim_board():get_smart_by_name(gulag_name)
     *       const tcover = cover_manager.get_cover(npc, smart)
     *       if tcover ~= null and tcover.is_smart_cover then
     *         const level_id = game_graph():vertex(smart.m_game_vertex_id):level_id()
     *         printf("precalc cover:lvl_id[%s] vertex_id[%s]", tostring(level_id), tostring(tcover.cover_vertex_id))
     *         cover = se_smart_cover.registered_smartcovers_by_lv_id[level_id][tcover.cover_vertex_id]
     *         printf("precalc cover_name [%s]", cover:name())
     *         st.cover_name = cover:name()
     *         st.target_position = tcover.look_pos
     *       end
     *     end
     *   ]]--
     */
  }
}

import { alife, stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { script_sounds } from "@/mod/globals/sound/script_sounds";
import { Optional } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { action_ids } from "@/mod/scripts/core/actions_id";
import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { evaluators_id } from "@/mod/scripts/core/evaluators_id";
import { AbstractSchemeImplementation } from "@/mod/scripts/core/logic/AbstractSchemeImplementation";
import { ActionHelpWounded } from "@/mod/scripts/core/logic/actions/ActionHelpWounded";
import { ActionWoundManager } from "@/mod/scripts/core/logic/ActionWoundManager";
import { EvaluatorWoundedExist } from "@/mod/scripts/core/logic/evaluators/EvaluatorWoundedExist";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { getConfigBoolean } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionSchemeHelpWounded");

export class ActionSchemeHelpWounded extends AbstractSchemeImplementation {
  public static readonly SCHEME_SECTION: EScheme = EScheme.HELP_WOUNDED;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", npc.name());

    const operators = {
      help_wounded: action_ids.wounded_exist,
      state_mgr_to_idle_alife: action_ids.state_mgr + 2,
    };
    const properties = {
      wounded_exist: evaluators_id.wounded_exist,
      wounded: evaluators_id.sidor_wounded_base,
    };

    const manager: XR_action_planner = npc.motivation_action_manager();

    manager.add_evaluator(
      properties.wounded_exist,
      create_xr_class_instance(EvaluatorWoundedExist, "wounded_exist", state)
    );

    const action = create_xr_class_instance(ActionHelpWounded, ActionHelpWounded.__name, state);

    action.add_precondition(new world_property(stalker_ids.property_alive, true));
    action.add_precondition(new world_property(stalker_ids.property_enemy, false));
    action.add_precondition(new world_property(stalker_ids.property_danger, false));
    action.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    action.add_precondition(new world_property(properties.wounded_exist, true));
    action.add_precondition(new world_property(properties.wounded, false));
    action.add_effect(new world_property(properties.wounded_exist, false));
    manager.add_action(operators.help_wounded, action);

    manager.action(action_ids.alife).add_precondition(new world_property(properties.wounded_exist, false));

    manager
      .action(operators.state_mgr_to_idle_alife)
      .add_precondition(new world_property(properties.wounded_exist, false));
  }

  public static resetScheme(npc: XR_game_object, scheme: EScheme, st: IStoredObject, section: TSection) {
    st.help_wounded.help_wounded_enabled = getConfigBoolean(st.ini!, section, "help_wounded_enabled", npc, false, true);
  }

  public static is_under_help_wounded(object: XR_game_object): boolean {
    const actionManager: XR_action_planner = object.motivation_action_manager();

    if (!actionManager.initialized()) {
      return false;
    }

    return actionManager.current_action_id() === action_ids.wounded_exist;
  }

  public static set_help_wounded(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: Optional<TSection>
  ) {
    assignStorageAndBind(object, ini, scheme, section);
  }

  public static help_wounded(object: XR_game_object): void {
    const selected_id: number = storage.get(object.id()).help_wounded.selected_id;
    const selected_npc: Optional<XR_game_object> = storage.get(selected_id) && storage.get(selected_id).object!;

    if (selected_npc === null) {
      return;
    }

    alife().create(
      "medkit_script",
      selected_npc.position(),
      selected_npc.level_vertex_id(),
      selected_npc.game_vertex_id(),
      selected_id
    );

    ActionWoundManager.unlock_medkit(selected_npc);

    storage.get(selected_id).wounded_already_selected = -1;

    GlobalSound.set_sound_play(object.id(), script_sounds.wounded_medkit, null, null);
  }
}

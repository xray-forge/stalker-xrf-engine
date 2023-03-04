import { alife, stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { script_sounds } from "@/mod/globals/sound/script_sounds";
import { Optional } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { GlobalSoundManager } from "@/mod/scripts/core/GlobalSoundManager";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme, action_ids, evaluators_id } from "@/mod/scripts/core/schemes/base";
import { ActionHelpWounded } from "@/mod/scripts/core/schemes/help_wounded/actions";
import { EvaluatorWoundedExist } from "@/mod/scripts/core/schemes/help_wounded/evaluators";
import { SchemeWounded } from "@/mod/scripts/core/schemes/wounded/SchemeWounded";
import { getConfigBoolean } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeHelpWounded");

/**
 * todo;
 */
export class SchemeHelpWounded extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.HELP_WOUNDED;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override add_to_binder(
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

    manager.add_evaluator(properties.wounded_exist, new EvaluatorWoundedExist(state));

    const action: ActionHelpWounded = new ActionHelpWounded(state);

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

  public static override resetScheme(npc: XR_game_object, scheme: EScheme, st: IStoredObject, section: TSection) {
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
    const selected_id: number = registry.objects.get(object.id()).help_wounded.selected_id;
    const selected_npc: Optional<XR_game_object> =
      registry.objects.get(selected_id) && registry.objects.get(selected_id).object!;

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

    SchemeWounded.unlock_medkit(selected_npc);

    registry.objects.get(selected_id).wounded_already_selected = -1;

    GlobalSoundManager.setSoundPlay(object.id(), script_sounds.wounded_medkit, null, null);
  }
}

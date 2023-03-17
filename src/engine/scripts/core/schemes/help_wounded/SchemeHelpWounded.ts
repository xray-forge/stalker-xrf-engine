import { alife, stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { script_sounds } from "@/engine/lib/constants/sound/script_sounds";
import { Optional, TNumberId } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";
import { IRegistryObjectState, registry } from "@/engine/scripts/core/database";
import { GlobalSoundManager } from "@/engine/scripts/core/managers/GlobalSoundManager";
import { AbstractScheme, action_ids, evaluators_id } from "@/engine/scripts/core/schemes/base";
import { ActionHelpWounded } from "@/engine/scripts/core/schemes/help_wounded/actions";
import { EvaluatorWoundedExist } from "@/engine/scripts/core/schemes/help_wounded/evaluators";
import { ISchemeHelpWoundedState } from "@/engine/scripts/core/schemes/help_wounded/ISchemeHelpWoundedState";
import { SchemeWounded } from "@/engine/scripts/core/schemes/wounded/SchemeWounded";
import { getConfigBoolean } from "@/engine/scripts/utils/config";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeHelpWounded extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.HELP_WOUNDED;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeHelpWoundedState
  ): void {
    const operators = {
      help_wounded: action_ids.wounded_exist,
      state_mgr_to_idle_alife: action_ids.state_mgr + 2,
    };
    const properties = {
      wounded_exist: evaluators_id.wounded_exist,
      wounded: evaluators_id.sidor_wounded_base,
    };

    const actionPlanner: XR_action_planner = object.motivation_action_manager();

    actionPlanner.add_evaluator(properties.wounded_exist, new EvaluatorWoundedExist(state));

    const action: ActionHelpWounded = new ActionHelpWounded(state);

    action.add_precondition(new world_property(stalker_ids.property_alive, true));
    action.add_precondition(new world_property(stalker_ids.property_enemy, false));
    action.add_precondition(new world_property(stalker_ids.property_danger, false));
    action.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    action.add_precondition(new world_property(properties.wounded_exist, true));
    action.add_precondition(new world_property(properties.wounded, false));
    action.add_effect(new world_property(properties.wounded_exist, false));

    actionPlanner.add_action(operators.help_wounded, action);
    actionPlanner.action(action_ids.alife).add_precondition(new world_property(properties.wounded_exist, false));
    actionPlanner
      .action(operators.state_mgr_to_idle_alife)
      .add_precondition(new world_property(properties.wounded_exist, false));
  }

  /**
   * todo;
   */
  public static override resetScheme(
    object: XR_game_object,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ) {
    (state[SchemeHelpWounded.SCHEME_SECTION] as ISchemeHelpWoundedState).help_wounded_enabled = getConfigBoolean(
      state.ini!,
      section,
      "help_wounded_enabled",
      object,
      false,
      true
    );
  }

  /**
   * todo;
   */
  public static isUnderHelpWounded(object: XR_game_object): boolean {
    const actionManager: XR_action_planner = object.motivation_action_manager();

    if (!actionManager.initialized()) {
      return false;
    }

    return actionManager.current_action_id() === action_ids.wounded_exist;
  }

  /**
   * todo;
   */
  public static setHelpWounded(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: Optional<TSection>) {
    AbstractScheme.assignStateAndBind(object, ini, scheme, section);
  }

  /**
   * todo;
   */
  public static helpWounded(object: XR_game_object): void {
    const state: IRegistryObjectState = registry.objects.get(object.id());
    const selectedId: TNumberId = (state[EScheme.HELP_WOUNDED] as ISchemeHelpWoundedState).selected_id;
    const selectedObject: Optional<XR_game_object> =
      registry.objects.get(selectedId) && registry.objects.get(selectedId).object!;

    if (selectedObject === null) {
      return;
    }

    alife().create(
      "medkit_script",
      selectedObject.position(),
      selectedObject.level_vertex_id(),
      selectedObject.game_vertex_id(),
      selectedId
    );

    SchemeWounded.unlockMedkit(selectedObject);

    registry.objects.get(selectedId).wounded_already_selected = -1;

    GlobalSoundManager.getInstance().setSoundPlaying(object.id(), script_sounds.wounded_medkit, null, null);
  }
}

import { alife, stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { AbstractScheme, EActionId, EEvaluatorId } from "@/engine/core/schemes";
import { ActionHelpWounded } from "@/engine/core/schemes/help_wounded/actions";
import { EvaluatorWoundedExist } from "@/engine/core/schemes/help_wounded/evaluators";
import { ISchemeHelpWoundedState } from "@/engine/core/schemes/help_wounded/ISchemeHelpWoundedState";
import { SchemeWounded } from "@/engine/core/schemes/wounded/SchemeWounded";
import { readIniBoolean } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { scriptSounds } from "@/engine/lib/constants/sound/script_sounds";
import { Optional, TNumberId } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeHelpWounded extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.HELP_WOUNDED;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo: Description.
   */
  public static override activate(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: Optional<TSection>
  ) {
    AbstractScheme.assign(object, ini, scheme, section);
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeHelpWoundedState
  ): void {
    const actionPlanner: XR_action_planner = object.motivation_action_manager();

    actionPlanner.add_evaluator(EEvaluatorId.IS_WOUNDED_EXISTING, new EvaluatorWoundedExist(state));

    const action: ActionHelpWounded = new ActionHelpWounded(state);

    action.add_precondition(new world_property(stalker_ids.property_alive, true));
    action.add_precondition(new world_property(stalker_ids.property_enemy, false));
    action.add_precondition(new world_property(stalker_ids.property_danger, false));
    action.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    action.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED_EXISTING, true));
    action.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    action.add_effect(new world_property(EEvaluatorId.IS_WOUNDED_EXISTING, false));

    actionPlanner.add_action(EActionId.HELP_WOUNDED, action);
    actionPlanner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_WOUNDED_EXISTING, false));
    actionPlanner
      .action(EActionId.STATE_TO_IDLE_ALIFE)
      .add_precondition(new world_property(EEvaluatorId.IS_WOUNDED_EXISTING, false));
  }

  /**
   * todo: Description.
   */
  public static override reset(
    object: XR_game_object,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ) {
    (state[SchemeHelpWounded.SCHEME_SECTION] as ISchemeHelpWoundedState).help_wounded_enabled = readIniBoolean(
      state.ini!,
      section,
      "help_wounded_enabled",
      false,
      true
    );
  }

  /**
   * todo: Description.
   */
  public static isUnderHelpWounded(object: XR_game_object): boolean {
    const actionManager: XR_action_planner = object.motivation_action_manager();

    if (!actionManager.initialized()) {
      return false;
    }

    return actionManager.current_action_id() === EActionId.HELP_WOUNDED;
  }

  /**
   * todo: Description.
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

    GlobalSoundManager.getInstance().playSound(object.id(), scriptSounds.wounded_medkit, null, null);
  }
}

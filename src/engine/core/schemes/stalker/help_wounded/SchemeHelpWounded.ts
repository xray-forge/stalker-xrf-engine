import { world_property } from "xray16";

import { AbstractScheme } from "@/engine/core/ai/scheme";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/types";
import { IRegistryObjectState } from "@/engine/core/database";
import { ActionHelpWounded } from "@/engine/core/schemes/stalker/help_wounded/actions";
import { EvaluatorWoundedExist } from "@/engine/core/schemes/stalker/help_wounded/evaluators";
import { ISchemeHelpWoundedState } from "@/engine/core/schemes/stalker/help_wounded/help_wounded_types";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { readIniBoolean } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ActionPlanner, GameObject, IniFile, Optional } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme describing object logics for helping friendly injured stalkers.
 * Part of shared generics logics available for all stalker objects.
 */
export class SchemeHelpWounded extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.HELP_WOUNDED;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: Optional<TSection>
  ): ISchemeWoundedState {
    return AbstractScheme.assign(object, ini, scheme, section);
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeHelpWoundedState
  ): void {
    const actionPlanner: ActionPlanner = object.motivation_action_manager();

    // Add custom evaluator to check if wounded stalkers exist nearby.
    actionPlanner.add_evaluator(EEvaluatorId.IS_WOUNDED_EXISTING, new EvaluatorWoundedExist(state));

    const action: ActionHelpWounded = new ActionHelpWounded(state);

    action.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    action.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
    action.add_precondition(new world_property(EEvaluatorId.DANGER, false));
    action.add_precondition(new world_property(EEvaluatorId.ANOMALY, false));
    action.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    action.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED_EXISTING, true));

    // Clean up wounded stalkers search once action is finished.
    action.add_effect(new world_property(EEvaluatorId.IS_WOUNDED_EXISTING, false));

    // Help stalkers nearby if conditions are met.
    actionPlanner.add_action(EActionId.HELP_WOUNDED, action);

    // Do not allow items collection when wounded are nearby.
    actionPlanner
      .action(EActionId.STATE_TO_IDLE_ITEMS)
      .add_precondition(new world_property(EEvaluatorId.IS_WOUNDED_EXISTING, false));

    // Do not allow alife activity before finish helping all stalkers nearby.
    actionPlanner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_WOUNDED_EXISTING, false));

    // Do not allow alife idle activity before finish helping all stalkers nearby.
    actionPlanner
      .action(EActionId.STATE_TO_IDLE_ALIFE)
      .add_precondition(new world_property(EEvaluatorId.IS_WOUNDED_EXISTING, false));
  }

  public static override reset(
    object: GameObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    (state[SchemeHelpWounded.SCHEME_SECTION] as ISchemeHelpWoundedState).isHelpingWoundedEnabled = readIniBoolean(
      state.ini,
      section,
      "help_wounded_enabled",
      false,
      true
    );
  }
}

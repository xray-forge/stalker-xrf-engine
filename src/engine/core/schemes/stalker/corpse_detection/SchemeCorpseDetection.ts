import { world_property } from "xray16";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { AbstractScheme } from "@/engine/core/ai/scheme";
import { IRegistryObjectState } from "@/engine/core/database";
import { ActionSearchCorpse } from "@/engine/core/schemes/stalker/corpse_detection/actions";
import { ISchemeCorpseDetectionState } from "@/engine/core/schemes/stalker/corpse_detection/corpse_detection_types";
import { EvaluatorCorpseDetect } from "@/engine/core/schemes/stalker/corpse_detection/evaluators";
import { readIniBoolean } from "@/engine/core/utils/ini";
import { ActionPlanner, GameObject, IniFile, Optional } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

/**
 * Scheme describing object logics for looting of corpses.
 * Part of shared generics logics available for all stalker objects.
 */
export class SchemeCorpseDetection extends AbstractScheme {
  public static override SCHEME_SECTION: EScheme = EScheme.CORPSE_DETECTION;
  public static override SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: Optional<TSection>
  ): ISchemeCorpseDetectionState {
    return AbstractScheme.assign(object, ini, scheme, section);
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCorpseDetectionState
  ): void {
    const planner: ActionPlanner = object.motivation_action_manager();

    // Add evaluator to check if anything can be looted.
    planner.add_evaluator(EEvaluatorId.IS_CORPSE_EXISTING, new EvaluatorCorpseDetect(state));

    const action: ActionSearchCorpse = new ActionSearchCorpse(state);

    action.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    action.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
    action.add_precondition(new world_property(EEvaluatorId.DANGER, false));
    action.add_precondition(new world_property(EEvaluatorId.ANOMALY, false));
    action.add_precondition(new world_property(EEvaluatorId.IS_CORPSE_EXISTING, true));
    action.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED_EXISTING, false));

    action.add_effect(new world_property(EEvaluatorId.IS_CORPSE_EXISTING, false));

    // Add alife action for execution when evaluator allows to do so.
    planner.add_action(EActionId.SEARCH_CORPSE, action);

    // Do not return to alife when searching for corpse.
    planner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_CORPSE_EXISTING, false));

    // Do not return to alife idle when searching for corpse.
    planner
      .action(EActionId.STATE_TO_IDLE_ALIFE)
      .add_precondition(new world_property(EEvaluatorId.IS_CORPSE_EXISTING, false));
  }

  public static override reset(
    object: GameObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    (state[EScheme.CORPSE_DETECTION] as ISchemeCorpseDetectionState).isCorpseDetectionEnabled = readIniBoolean(
      state.ini,
      section,
      "corpse_detection_enabled",
      false,
      true
    );
  }
}

import { world_property } from "xray16";

import { IRegistryObjectState } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/objects/ai/scheme";
import { EActionId, EEvaluatorId } from "@/engine/core/objects/ai/types";
import { ActionSearchCorpse } from "@/engine/core/schemes/corpse_detection/actions";
import { EvaluatorCorpseDetect } from "@/engine/core/schemes/corpse_detection/evaluators";
import { ISchemeCorpseDetectionState } from "@/engine/core/schemes/corpse_detection/ISchemeCorpseDetectionState";
import { readIniBoolean } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ActionPlanner, ClientObject, IniFile, Optional } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme describing object logics for looting of corpses.
 * Part of shared generics logics available for all stalker objects.
 */
export class SchemeCorpseDetection extends AbstractScheme {
  public static override SCHEME_SECTION: EScheme = EScheme.CORPSE_DETECTION;
  public static override SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * Activate section with corpse detection for the object.
   */
  public static override activate(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: Optional<TSection>
  ): void {
    AbstractScheme.assign(object, ini, scheme, section);
  }

  /**
   * Add scheme generic states / evaluators / actions for the object.
   */
  public static override add(
    object: ClientObject,
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
    action.add_precondition(new world_property(EEvaluatorId.ANONALY, false));
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

  /**
   * Reset scheme state for the object.
   * Read configuration from current active logics.
   */
  public static override reset(
    object: ClientObject,
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

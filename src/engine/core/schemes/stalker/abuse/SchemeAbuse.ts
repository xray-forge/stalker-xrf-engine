import { world_property } from "xray16";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { AbstractScheme } from "@/engine/core/ai/scheme";
import { IRegistryObjectState } from "@/engine/core/database";
import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse/abuse_types";
import { AbuseManager } from "@/engine/core/schemes/stalker/abuse/AbuseManager";
import { ActionAbuseHit } from "@/engine/core/schemes/stalker/abuse/actions/ActionAbuseHit";
import { EvaluatorAbuse } from "@/engine/core/schemes/stalker/abuse/evaluators/EvaluatorAbuse";
import { ActionPlanner, EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";

/**
 * Generic scheme to measure abuse when clicking stalkers for many times.
 * On abuse, hit abuser.
 */
export class SchemeAbuse extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.ABUSE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeAbuseState {
    return AbstractScheme.assign(object, ini, scheme, section);
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeAbuseState
  ): void {
    const planner: ActionPlanner = object.motivation_action_manager();

    planner.add_evaluator(EEvaluatorId.IS_ABUSED, new EvaluatorAbuse(state));

    const action: ActionAbuseHit = new ActionAbuseHit(state);

    action.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    action.add_precondition(new world_property(EEvaluatorId.DANGER, false));
    action.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    action.add_precondition(new world_property(EEvaluatorId.IS_ABUSED, true));
    action.add_effect(new world_property(EEvaluatorId.IS_ABUSED, false));

    planner.add_action(EActionId.ABUSE, action);

    planner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_ABUSED, false));

    state.abuseManager = new AbuseManager(object, state);
  }

  public static override reset(
    object: GameObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {}
}

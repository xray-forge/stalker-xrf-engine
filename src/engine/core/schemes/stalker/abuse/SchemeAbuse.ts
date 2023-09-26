import { world_property } from "xray16";

import { IRegistryObjectState } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/objects/ai/scheme";
import { EActionId, EEvaluatorId } from "@/engine/core/objects/ai/types";
import { AbuseManager } from "@/engine/core/schemes/stalker/abuse/AbuseManager";
import { ActionAbuseHit } from "@/engine/core/schemes/stalker/abuse/actions/ActionAbuseHit";
import { EvaluatorAbuse } from "@/engine/core/schemes/stalker/abuse/evaluators/EvaluatorAbuse";
import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse/ISchemeAbuseState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ActionPlanner, ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Generic scheme to measure abuse when clicking stalkers for many times.
 * On abuse, hit abuser.
 */
export class SchemeAbuse extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.ABUSE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeAbuseState {
    return AbstractScheme.assign(object, ini, scheme, section);
  }

  public static override add(
    object: ClientObject,
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
    object: ClientObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {}
}

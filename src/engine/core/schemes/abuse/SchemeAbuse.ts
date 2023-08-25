import { stalker_ids, world_property } from "xray16";

import { IRegistryObjectState } from "@/engine/core/database";
import { EActionId, EEvaluatorId } from "@/engine/core/objects/ai/types";
import { AbstractScheme } from "@/engine/core/schemes";
import { AbuseManager } from "@/engine/core/schemes/abuse/AbuseManager";
import { ActionAbuseHit } from "@/engine/core/schemes/abuse/actions/ActionAbuseHit";
import { EvaluatorAbuse } from "@/engine/core/schemes/abuse/evaluators/EvaluatorAbuse";
import { ISchemeAbuseState } from "@/engine/core/schemes/abuse/ISchemeAbuseState";
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

  /**
   * Activate abuse scheme.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    AbstractScheme.assign(object, ini, scheme, section);
  }

  /**
   * Add scheme to object state.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeAbuseState
  ): void {
    const actionPlanner: ActionPlanner = object.motivation_action_manager();

    actionPlanner.add_evaluator(EEvaluatorId.IS_ABUSED, new EvaluatorAbuse(state));

    const action: ActionAbuseHit = new ActionAbuseHit(state);

    action.add_precondition(new world_property(stalker_ids.property_alive, true));
    action.add_precondition(new world_property(stalker_ids.property_danger, false));
    action.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    action.add_precondition(new world_property(EEvaluatorId.IS_ABUSED, true));
    action.add_effect(new world_property(EEvaluatorId.IS_ABUSED, false));

    actionPlanner.add_action(EActionId.ABUSE, action);

    actionPlanner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_ABUSED, false));

    state.abuseManager = new AbuseManager(object, state);
  }

  /**
   * Reset scheme for an object.
   */
  public static override reset(
    object: ClientObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {}
}

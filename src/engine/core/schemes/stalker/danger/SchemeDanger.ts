import { cast_planner } from "xray16";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { AbstractScheme } from "@/engine/core/ai/scheme";
import { IRegistryObjectState } from "@/engine/core/database";
import { ISchemeDangerState } from "@/engine/core/schemes/stalker/danger/danger_types";
import { DangerManager } from "@/engine/core/schemes/stalker/danger/DangerManager";
import { EvaluatorDanger } from "@/engine/core/schemes/stalker/danger/evaluators";
import { ActionPlanner, EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";

/**
 * Scheme implementing logics of handling / checking danger for stalkers.
 */
export class SchemeDanger extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.DANGER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeDangerState {
    return AbstractScheme.assign(object, ini, scheme, section);
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeDangerState
  ): void {
    const planner: ActionPlanner = object.motivation_action_manager();
    const dangerActionPlanner: ActionPlanner = cast_planner(planner.action(EActionId.DANGER));

    planner.remove_evaluator(EEvaluatorId.DANGER);
    planner.add_evaluator(EEvaluatorId.DANGER, new EvaluatorDanger(state));

    dangerActionPlanner.remove_evaluator(EEvaluatorId.DANGER);
    dangerActionPlanner.add_evaluator(EEvaluatorId.DANGER, new EvaluatorDanger(state));

    // Assign manager to handle danger events.
    state.dangerManager = new DangerManager(object, state);
  }

  public static override reset(
    object: GameObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {}
}

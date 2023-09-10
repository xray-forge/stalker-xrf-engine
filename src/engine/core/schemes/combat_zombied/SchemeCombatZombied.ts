import { world_property } from "xray16";

import { AbstractScheme } from "@/engine/core/objects/ai/scheme";
import { EActionId, EEvaluatorId } from "@/engine/core/objects/ai/types";
import { ISchemeCombatState } from "@/engine/core/schemes/combat";
import { ActionZombieGoToDanger, ActionZombieShoot } from "@/engine/core/schemes/combat_zombied/actions";
import { EvaluatorCombatZombied } from "@/engine/core/schemes/combat_zombied/evaluators";
import { assertDefined } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ActionPlanner, ClientObject, IniFile } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * Note: not atomic scheme, just helper
 */
export class SchemeCombatZombied extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.COMBAT_ZOMBIED;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCombatState,
    planner?: ActionPlanner
  ): void {
    assertDefined(planner, "Expected planner to be provided for add method call.");

    planner.add_evaluator(EEvaluatorId.IS_COMBAT_ZOMBIED_ENABLED, new EvaluatorCombatZombied(state));

    const actionZombieShoot: ActionZombieShoot = new ActionZombieShoot(state);

    actionZombieShoot.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionZombieShoot.add_precondition(new world_property(EEvaluatorId.IS_COMBAT_ZOMBIED_ENABLED, true));
    actionZombieShoot.add_precondition(new world_property(EEvaluatorId.IS_SCRIPTED_COMBAT, true));
    actionZombieShoot.add_effect(new world_property(EEvaluatorId.ENEMY, false));
    actionZombieShoot.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    planner.add_action(EActionId.ZOMBIED_SHOOT, actionZombieShoot);

    SchemeCombatZombied.subscribe(object, state, actionZombieShoot);

    const actionZombieGoToDanger: ActionZombieGoToDanger = new ActionZombieGoToDanger(state);

    actionZombieGoToDanger.add_precondition(new world_property(EEvaluatorId.ALIFE, true));
    actionZombieGoToDanger.add_precondition(new world_property(EEvaluatorId.IS_COMBAT_ZOMBIED_ENABLED, true));
    actionZombieGoToDanger.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
    actionZombieGoToDanger.add_precondition(new world_property(EEvaluatorId.DANGER, true));
    actionZombieGoToDanger.add_effect(new world_property(EEvaluatorId.DANGER, false));
    actionZombieGoToDanger.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    planner.add_action(EActionId.ZOMBIED_GO_TO_DANGER, actionZombieGoToDanger);

    SchemeCombatZombied.subscribe(object, state, actionZombieGoToDanger);
  }
}

import { world_property } from "xray16";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { AbstractScheme } from "@/engine/core/ai/scheme";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat";
import { ActionZombieGoToDanger, ActionZombieShoot } from "@/engine/core/schemes/stalker/combat_zombied/actions";
import { EvaluatorCombatZombied } from "@/engine/core/schemes/stalker/combat_zombied/evaluators";
import { assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ActionPlanner, GameObject, IniFile } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme describing combat of zombied type.
 * Zombied combat includes walking to danger, stupid actions without usage of covers and checking any noise.
 */
export class SchemeCombatZombied extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.COMBAT_ZOMBIED;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCombatState,
    planner?: ActionPlanner
  ): void {
    logger.info("Add zombied combat: %s", object.name());

    assert(planner, "Expected planner to be provided for add method call.");

    planner.add_evaluator(EEvaluatorId.IS_COMBAT_ZOMBIED_ENABLED, new EvaluatorCombatZombied(state));

    const actionZombieShoot: ActionZombieShoot = new ActionZombieShoot(state);

    actionZombieShoot.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionZombieShoot.add_precondition(new world_property(EEvaluatorId.IS_COMBAT_ZOMBIED_ENABLED, true));
    actionZombieShoot.add_precondition(new world_property(EEvaluatorId.IS_SCRIPTED_COMBAT, true));
    actionZombieShoot.add_effect(new world_property(EEvaluatorId.ENEMY, false));
    actionZombieShoot.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));

    planner.add_action(EActionId.ZOMBIED_SHOOT, actionZombieShoot);

    AbstractScheme.subscribe(state, actionZombieShoot);

    const actionZombieGoToDanger: ActionZombieGoToDanger = new ActionZombieGoToDanger(state);

    actionZombieGoToDanger.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionZombieGoToDanger.add_precondition(new world_property(EEvaluatorId.IS_COMBAT_ZOMBIED_ENABLED, true));
    actionZombieGoToDanger.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
    actionZombieGoToDanger.add_precondition(new world_property(EEvaluatorId.DANGER, true));
    actionZombieGoToDanger.add_effect(new world_property(EEvaluatorId.DANGER, false));
    actionZombieGoToDanger.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));

    planner.add_action(EActionId.ZOMBIED_GO_TO_DANGER, actionZombieGoToDanger);

    AbstractScheme.subscribe(state, actionZombieGoToDanger);
  }
}

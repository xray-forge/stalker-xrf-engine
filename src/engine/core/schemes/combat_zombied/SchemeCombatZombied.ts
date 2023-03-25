import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme, EActionId, EEvaluatorId } from "@/engine/core/schemes";
import { ISchemeCombatState } from "@/engine/core/schemes/combat";
import { ActionZombieGoToDanger, ActionZombieShoot } from "@/engine/core/schemes/combat_zombied/actions";
import { EvaluatorCombatZombied } from "@/engine/core/schemes/combat_zombied/evaluators";
import { assertDefined } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
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
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCombatState,
    planner?: XR_action_planner
  ): void {
    assertDefined(planner, "Expected planner to be provided for add method call.");

    planner.add_evaluator(EEvaluatorId.IS_COMBAT_ZOMBIED_ENABLED, new EvaluatorCombatZombied(state));

    const actionZombieShoot: ActionZombieShoot = new ActionZombieShoot(state);

    actionZombieShoot.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionZombieShoot.add_precondition(new world_property(EEvaluatorId.IS_COMBAT_ZOMBIED_ENABLED, true));
    actionZombieShoot.add_precondition(new world_property(EEvaluatorId.IS_SCRIPTED_COMBAT, true));
    actionZombieShoot.add_effect(new world_property(stalker_ids.property_enemy, false));
    actionZombieShoot.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    planner.add_action(EActionId.ZOMBIED_SHOOT, actionZombieShoot);

    SchemeCombatZombied.subscribe(object, state, actionZombieShoot);

    const actionZombieGoToDanger: ActionZombieGoToDanger = new ActionZombieGoToDanger(state);

    actionZombieGoToDanger.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionZombieGoToDanger.add_precondition(new world_property(EEvaluatorId.IS_COMBAT_ZOMBIED_ENABLED, true));
    actionZombieGoToDanger.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionZombieGoToDanger.add_precondition(new world_property(stalker_ids.property_danger, true));
    actionZombieGoToDanger.add_effect(new world_property(stalker_ids.property_danger, false));
    actionZombieGoToDanger.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    planner.add_action(EActionId.ZOMBIED_GO_TO_DANGER, actionZombieGoToDanger);

    SchemeCombatZombied.subscribe(object, state, actionZombieGoToDanger);
  }
}

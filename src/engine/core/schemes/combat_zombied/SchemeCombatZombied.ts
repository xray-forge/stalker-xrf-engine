import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { action_ids } from "@/engine/core/schemes/base/actions_id";
import { evaluators_id } from "@/engine/core/schemes/base/evaluators_id";
import { ISchemeCombatState } from "@/engine/core/schemes/combat";
import { ActionZombieGoToDanger, ActionZombieShoot } from "@/engine/core/schemes/combat_zombied/actions";
import { EvaluatorCombatZombied } from "@/engine/core/schemes/combat_zombied/evaluators";
import { assertDefined } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
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

    const properties = {
      state_mgr_logic_active: evaluators_id.state_mgr + 4,
    };

    planner.add_evaluator(evaluators_id.combat_zombied_base, new EvaluatorCombatZombied(state));

    const actionZombieShoot: ActionZombieShoot = new ActionZombieShoot(state);

    actionZombieShoot.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionZombieShoot.add_precondition(new world_property(evaluators_id.combat_zombied_base, true));
    actionZombieShoot.add_precondition(new world_property(evaluators_id.script_combat, true));
    actionZombieShoot.add_effect(new world_property(stalker_ids.property_enemy, false));
    actionZombieShoot.add_effect(new world_property(properties.state_mgr_logic_active, false));
    planner.add_action(action_ids.combat_zombied_base, actionZombieShoot);

    SchemeCombatZombied.subscribe(object, state, actionZombieShoot);

    const actionZombieGoToDanger: ActionZombieGoToDanger = new ActionZombieGoToDanger(state);

    actionZombieGoToDanger.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionZombieGoToDanger.add_precondition(new world_property(evaluators_id.combat_zombied_base, true));
    actionZombieGoToDanger.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionZombieGoToDanger.add_precondition(new world_property(stalker_ids.property_danger, true));
    actionZombieGoToDanger.add_effect(new world_property(stalker_ids.property_danger, false));
    actionZombieGoToDanger.add_effect(new world_property(properties.state_mgr_logic_active, false));
    planner.add_action(action_ids.combat_zombied_base + 1, actionZombieGoToDanger);

    SchemeCombatZombied.subscribe(object, state, actionZombieGoToDanger);
  }
}

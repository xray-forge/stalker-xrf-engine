import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { action_ids } from "@/mod/scripts/core/schemes/base/actions_id";
import { evaluators_id } from "@/mod/scripts/core/schemes/base/evaluators_id";
import { ActionZombieGoToDanger, ActionZombieShoot } from "@/mod/scripts/core/schemes/combat_zombied/actions";
import { EvaluatorCombatZombied } from "@/mod/scripts/core/schemes/combat_zombied/evaluators";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeCombatZombied");

/**
 * todo;
 */
export class SchemeCombatZombied extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.COMBAT_ZOMBIED;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject,
    planner?: XR_action_planner
  ): void {
    logger.info("Add to binder:", object.name());

    if (!planner) {
      abort("Expected planner to be provided for addToBinder method call.");
    }

    const properties = {
      state_mgr_logic_active: evaluators_id.state_mgr + 4,
    };

    planner.add_evaluator(
      evaluators_id.combat_zombied_base,
      new EvaluatorCombatZombied(registry.objects.get(object.id()))
    );

    const actionZombieShoot: ActionZombieShoot = new ActionZombieShoot(state);

    actionZombieShoot.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionZombieShoot.add_precondition(new world_property(evaluators_id.combat_zombied_base, true));
    actionZombieShoot.add_precondition(new world_property(evaluators_id.script_combat, true));
    actionZombieShoot.add_effect(new world_property(stalker_ids.property_enemy, false));
    actionZombieShoot.add_effect(new world_property(properties.state_mgr_logic_active, false));
    planner.add_action(action_ids.combat_zombied_base, actionZombieShoot);

    subscribeActionForEvents(object, state, actionZombieShoot);

    const actionZombieGoToDanger: ActionZombieGoToDanger = new ActionZombieGoToDanger(state);

    actionZombieGoToDanger.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionZombieGoToDanger.add_precondition(new world_property(evaluators_id.combat_zombied_base, true));
    actionZombieGoToDanger.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionZombieGoToDanger.add_precondition(new world_property(stalker_ids.property_danger, true));
    actionZombieGoToDanger.add_effect(new world_property(stalker_ids.property_danger, false));
    actionZombieGoToDanger.add_effect(new world_property(properties.state_mgr_logic_active, false));
    planner.add_action(action_ids.combat_zombied_base + 1, actionZombieGoToDanger);

    subscribeActionForEvents(object, state, actionZombieGoToDanger);
  }
}

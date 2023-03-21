import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme, action_ids, evaluators_id } from "@/engine/core/schemes/base";
import { ISchemeCombatState } from "@/engine/core/schemes/combat";
import { ActionLookAround, ActionShoot } from "@/engine/core/schemes/combat_camper/actions";
import { EvaluatorCombatCamper, EvaluatorSee } from "@/engine/core/schemes/combat_camper/evaluator";
import { abort } from "@/engine/core/utils/debug";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const prop_enable = evaluators_id.combat_camper_base + 0;
const prop_see = evaluators_id.combat_camper_base + 1;
const act_shoot = action_ids.combat_camper_base + 0;
const act_look_around = action_ids.combat_camper_base + 1;

/**
 * todo
 */
export class SchemeCombatCamper extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.COMBAT_CAMPER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo: Description.
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCombatState,
    planner?: XR_action_planner
  ): void {
    if (!planner) {
      abort("Expected planner to be provided for addToBinder method call.");
    }

    const properties = {
      state_mgr_logic_active: evaluators_id.state_mgr + 4,
    };

    planner.add_evaluator(prop_enable, new EvaluatorCombatCamper(state));
    planner.add_evaluator(prop_see, new EvaluatorSee(state));

    const shootAction: ActionShoot = new ActionShoot(state);

    shootAction.add_precondition(new world_property(stalker_ids.property_alive, true));
    shootAction.add_precondition(new world_property(stalker_ids.property_enemy, true));
    shootAction.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    shootAction.add_precondition(new world_property(evaluators_id.script_combat, true));
    shootAction.add_precondition(new world_property(prop_enable, true));
    shootAction.add_precondition(new world_property(prop_see, true));
    shootAction.add_effect(new world_property(stalker_ids.property_enemy, false));
    shootAction.add_effect(new world_property(properties.state_mgr_logic_active, false));
    planner.add_action(act_shoot, shootAction);

    const lookAroundAction: ActionLookAround = new ActionLookAround(state);

    lookAroundAction.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    lookAroundAction.add_precondition(new world_property(evaluators_id.script_combat, true));
    lookAroundAction.add_precondition(new world_property(prop_enable, true));
    lookAroundAction.add_precondition(new world_property(prop_see, false));
    lookAroundAction.add_effect(new world_property(prop_see, true));
    lookAroundAction.add_effect(new world_property(properties.state_mgr_logic_active, false));
    planner.add_action(act_look_around, lookAroundAction);

    SchemeCombatCamper.subscribeToSchemaEvents(object, state, lookAroundAction);

    state.camper_combat_action = false;
  }
}

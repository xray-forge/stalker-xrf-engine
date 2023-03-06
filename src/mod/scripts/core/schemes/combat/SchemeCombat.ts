import { stalker_ids, world_property, XR_action_base, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { communities } from "@/mod/globals/communities";
import { STRINGIFIED_NIL } from "@/mod/globals/lua";
import { AnyObject, LuaArray, Optional } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { IRegistryObjectState, registry } from "@/mod/scripts/core/database";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme, evaluators_id } from "@/mod/scripts/core/schemes/base";
import { EvaluatorCheckCombat } from "@/mod/scripts/core/schemes/combat/evaluators/EvaluatorCheckCombat";
import { ISchemeCombatState } from "@/mod/scripts/core/schemes/combat/ISchemeCombatState";
import { SchemeCombatCamper } from "@/mod/scripts/core/schemes/combat_camper/SchemeCombatCamper";
import { SchemeCombatZombied } from "@/mod/scripts/core/schemes/combat_zombied/SchemeCombatZombied";
import { getCharacterCommunity } from "@/mod/scripts/utils/alife";
import { getConfigCondList, getConfigSwitchConditions, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { parseConditionsList } from "@/mod/scripts/utils/parse";

const logger: LuaLogger = new LuaLogger("SchemeCombat");

/**
 * todo;
 */
export class SchemeCombat extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.COMBAT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCombatState
  ): void {
    logger.info("Add to binder:", object.name());

    const actionPlanner: XR_action_planner = object.motivation_action_manager();

    actionPlanner.add_evaluator(evaluators_id.script_combat, new EvaluatorCheckCombat(state));

    const action: XR_action_base = actionPlanner.action(stalker_ids.action_combat_planner);

    action.add_precondition(new world_property(evaluators_id.script_combat, false));

    SchemeCombatZombied.addToBinder(object, ini, scheme, section, state, actionPlanner);
    SchemeCombatCamper.addToBinder(object, ini, scheme, section, state, actionPlanner);
  }

  /**
   * todo;
   */
  public static override disableScheme(object: XR_game_object, scheme: EScheme): void {
    const state: Optional<ISchemeCombatState> = registry.objects.get(object.id())[scheme] as ISchemeCombatState;

    if (state !== null) {
      state.enabled = false;
    }
  }

  /**
   * todo;
   */
  public static setCombatType(object: XR_game_object, actor: XR_game_object, target: Optional<AnyObject>): void {
    if (target === null) {
      return;
    }

    const state: IRegistryObjectState = registry.objects.get(object.id());

    state.enemy = object.best_enemy();

    let script_combat_type = null;

    if (target.combat_type !== null) {
      script_combat_type = pickSectionFromCondList(actor, object, target.combat_type.condlist);

      if (script_combat_type === STRINGIFIED_NIL) {
        script_combat_type = null;
      }
    }

    state.script_combat_type = script_combat_type;
    target.script_combat_type = script_combat_type;
  }

  /**
   * todo;
   */
  public static setCombatChecker(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const isZombied: boolean = getCharacterCommunity(object) === communities.zombied;

    if (section || isZombied) {
      const state: ISchemeCombatState = assignStorageAndBind(object, ini, scheme, section);

      state.logic = getConfigSwitchConditions(ini, section, object);
      state.enabled = true;

      state.combat_type = getConfigCondList(ini, section, "combat_type", object);

      if ((state.combat_type as any) === communities.monolith) {
        state.combat_type = null;
      }

      if (!state.combat_type && isZombied) {
        state.combat_type = { condlist: parseConditionsList(object, section, "", communities.zombied) };
      }

      if (state.combat_type) {
        SchemeCombat.setCombatType(object, registry.actor, state);
      }
    }
  }
}

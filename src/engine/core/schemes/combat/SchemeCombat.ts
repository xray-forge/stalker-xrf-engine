import { stalker_ids, world_property, XR_action_base, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractScheme, evaluators_id } from "@/engine/core/schemes/base";
import { EvaluatorCheckCombat } from "@/engine/core/schemes/combat/evaluators/EvaluatorCheckCombat";
import { ISchemeCombatState } from "@/engine/core/schemes/combat/ISchemeCombatState";
import { SchemeCombatCamper } from "@/engine/core/schemes/combat_camper/SchemeCombatCamper";
import { SchemeCombatZombied } from "@/engine/core/schemes/combat_zombied/SchemeCombatZombied";
import { getConfigSwitchConditions, pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { getConfigConditionList } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getCharacterCommunity } from "@/engine/core/utils/object";
import { parseConditionsList } from "@/engine/core/utils/parse";
import { communities } from "@/engine/lib/constants/communities";
import { NIL } from "@/engine/lib/constants/words";
import { AnyObject, Optional } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeCombat extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.COMBAT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo: Description.
   */
  public static override disable(object: XR_game_object, scheme: EScheme): void {
    const state: Optional<ISchemeCombatState> = registry.objects.get(object.id())[scheme] as ISchemeCombatState;

    if (state !== null) {
      state.enabled = false;
    }
  }

  /**
   * todo: Description.
   */
  public static override activate(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const isZombied: boolean = getCharacterCommunity(object) === communities.zombied;

    if (section || isZombied) {
      const state: ISchemeCombatState = AbstractScheme.assign(object, ini, scheme, section);

      state.logic = getConfigSwitchConditions(ini, section);
      state.enabled = true;

      state.combat_type = getConfigConditionList(ini, section, "combat_type");

      if ((state.combat_type as any) === communities.monolith) {
        state.combat_type = null;
      }

      if (!state.combat_type && isZombied) {
        state.combat_type = { condlist: parseConditionsList(communities.zombied) };
      }

      if (state.combat_type) {
        SchemeCombat.setCombatType(object, registry.actor, state);
      }
    }
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCombatState
  ): void {
    const actionPlanner: XR_action_planner = object.motivation_action_manager();

    actionPlanner.add_evaluator(evaluators_id.script_combat, new EvaluatorCheckCombat(state));

    const action: XR_action_base = actionPlanner.action(stalker_ids.action_combat_planner);

    action.add_precondition(new world_property(evaluators_id.script_combat, false));

    SchemeCombatZombied.add(object, ini, scheme, section, state, actionPlanner);
    SchemeCombatCamper.add(object, ini, scheme, section, state, actionPlanner);
  }

  /**
   * todo: Description.
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

      if (script_combat_type === NIL) {
        script_combat_type = null;
      }
    }

    state.script_combat_type = script_combat_type;
    target.script_combat_type = script_combat_type;
  }
}

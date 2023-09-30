import { world_property } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/objects/ai/scheme";
import { EActionId, EEvaluatorId } from "@/engine/core/objects/ai/types";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat/combat_types";
import { EvaluatorCheckCombat } from "@/engine/core/schemes/stalker/combat/evaluators/EvaluatorCheckCombat";
import { SchemeCombatCamper } from "@/engine/core/schemes/stalker/combat_camper/SchemeCombatCamper";
import { SchemeCombatZombied } from "@/engine/core/schemes/stalker/combat_zombied/SchemeCombatZombied";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { parseConditionsList, readIniConditionList } from "@/engine/core/utils/ini";
import { getConfigSwitchConditions, pickSectionFromCondList } from "@/engine/core/utils/ini/ini_config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { communities } from "@/engine/lib/constants/communities";
import { NIL } from "@/engine/lib/constants/words";
import { ActionBase, ActionPlanner, AnyObject, ClientObject, IniFile, Optional, TName } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeCombat extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.COMBAT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override disable(object: ClientObject, scheme: EScheme): void {
    const state: Optional<ISchemeCombatState> = registry.objects.get(object.id())[scheme] as ISchemeCombatState;

    if (state !== null) {
      state.enabled = false;
    }
  }

  public static override activate(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeCombatState {
    const isZombied: boolean = getObjectCommunity(object) === communities.zombied;

    if (section || isZombied) {
      logger.info("Activate scheme:", object.name());

      const state: ISchemeCombatState = AbstractScheme.assign(object, ini, scheme, section);

      state.logic = getConfigSwitchConditions(ini, section);
      state.enabled = true;

      state.combatType = readIniConditionList(ini, section, "combat_type");

      if ((state.combatType as unknown as string) === communities.monolith) {
        state.combatType = null;
      }

      if (!state.combatType && isZombied) {
        state.combatType = { condlist: parseConditionsList(communities.zombied) };
      }

      if (state.combatType) {
        SchemeCombat.setCombatType(object, registry.actor, state);
      }

      return state;
    }

    return registry.objects.get(object.id())[EScheme.COMBAT] as ISchemeCombatState;
  }

  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCombatState
  ): void {
    const actionPlanner: ActionPlanner = object.motivation_action_manager();

    actionPlanner.add_evaluator(EEvaluatorId.IS_SCRIPTED_COMBAT, new EvaluatorCheckCombat(state));

    const action: ActionBase = actionPlanner.action(EActionId.COMBAT);

    action.add_precondition(new world_property(EEvaluatorId.IS_SCRIPTED_COMBAT, false));

    SchemeCombatZombied.add(object, ini, scheme, section, state, actionPlanner);
    SchemeCombatCamper.add(object, ini, scheme, section, state, actionPlanner);
  }

  /**
   * todo: Description.
   */
  public static setCombatType(object: ClientObject, actor: ClientObject, overrides: Optional<AnyObject>): void {
    if (overrides === null) {
      return;
    }

    const state: IRegistryObjectState = registry.objects.get(object.id());

    state.enemy = object.best_enemy();

    let scriptCombatType: Optional<TName> = null;

    if (overrides.combat_type !== null) {
      scriptCombatType = pickSectionFromCondList(actor, object, overrides.combat_type.condlist);

      if (scriptCombatType === NIL) {
        scriptCombatType = null;
      }
    }

    state.script_combat_type = scriptCombatType;
    overrides.script_combat_type = scriptCombatType;
  }
}

import { world_property } from "xray16";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { AbstractScheme } from "@/engine/core/ai/scheme";
import { ILogicsOverrides, IRegistryObjectState, registry } from "@/engine/core/database";
import { EScriptCombatType, ISchemeCombatState } from "@/engine/core/schemes/stalker/combat/combat_types";
import { EvaluatorCheckCombat } from "@/engine/core/schemes/stalker/combat/evaluators/EvaluatorCheckCombat";
import { SchemeCombatCamper } from "@/engine/core/schemes/stalker/combat_camper/SchemeCombatCamper";
import { SchemeCombatZombied } from "@/engine/core/schemes/stalker/combat_zombied/SchemeCombatZombied";
import { getObjectCommunity } from "@/engine/core/utils/community";
import {
  getConfigSwitchConditions,
  parseConditionsList,
  parseStringOptional,
  pickSectionFromCondList,
  readIniConditionList,
} from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { communities } from "@/engine/lib/constants/communities";
import { ActionBase, ActionPlanner, GameObject, IniFile, Optional } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme implementing stalker combat types.
 */
export class SchemeCombat extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.COMBAT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override disable(object: GameObject, scheme: EScheme): void {
    const state: Optional<ISchemeCombatState> = registry.objects.get(object.id())[scheme] as ISchemeCombatState;

    if (state !== null) {
      state.enabled = false;
    }
  }

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeCombatState {
    const isZombied: boolean = getObjectCommunity(object) === communities.zombied;

    if (section || isZombied) {
      logger.info("Activate scheme: %s", object.name());

      const state: ISchemeCombatState = AbstractScheme.assign(object, ini, scheme, section);

      state.logic = getConfigSwitchConditions(ini, section);
      state.enabled = true;
      state.combatType = readIniConditionList(ini, section, "combat_type");

      if (!state.combatType && isZombied) {
        state.combatType = { condlist: parseConditionsList(EScriptCombatType.ZOMBIED) };
      }

      if (state.combatType) {
        SchemeCombat.setCombatType(object, registry.actor, state);
      }

      return state;
    }

    return registry.objects.get(object.id())[EScheme.COMBAT] as ISchemeCombatState;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCombatState
  ): void {
    const planner: ActionPlanner = object.motivation_action_manager();

    planner.add_evaluator(EEvaluatorId.IS_SCRIPTED_COMBAT, new EvaluatorCheckCombat(state));

    const combatAction: ActionBase = planner.action(EActionId.COMBAT);

    combatAction.add_precondition(new world_property(EEvaluatorId.IS_SCRIPTED_COMBAT, false));

    SchemeCombatZombied.add(object, ini, scheme, section, state, planner);
    SchemeCombatCamper.add(object, ini, scheme, section, state, planner);
  }

  /**
   * todo: Description.
   */
  public static setCombatType(
    object: GameObject,
    actor: GameObject,
    overrides: Optional<ILogicsOverrides | ISchemeCombatState>
  ): void {
    if (!overrides) {
      return;
    }

    const state: IRegistryObjectState = registry.objects.get(object.id());

    state.enemy = object.best_enemy();

    let scriptCombatType: Optional<EScriptCombatType> = null;

    if (overrides.combatType) {
      scriptCombatType = parseStringOptional(pickSectionFromCondList(actor, object, overrides.combatType.condlist));
    }

    state.scriptCombatType = scriptCombatType;
    overrides.scriptCombatType = scriptCombatType;
  }
}

import { AbstractScheme } from "@/engine/core/ai/scheme";
import { registry } from "@/engine/core/database";
import { ISchemeMobCombatState } from "@/engine/core/schemes/monster/mob_combat/mob_combat_types";
import { MobCombatManager } from "@/engine/core/schemes/monster/mob_combat/MobCombatManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { EScheme, ESchemeType, GameObject, IniFile, Optional, TSection } from "@/engine/lib/types";

/**
 * Scheme describing how monsters should handle combat.
 */
export class SchemeMobCombat extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_COMBAT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeMobCombatState {
    const state: ISchemeMobCombatState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.enabled = true;

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMobCombatState
  ): void {
    const manager: MobCombatManager = new MobCombatManager(object, state);

    state.action = manager;

    AbstractScheme.subscribe(state, manager);
  }

  public static override disable(object: GameObject, scheme: EScheme): void {
    const state: Optional<ISchemeMobCombatState> = registry.objects.get(object.id())[scheme] as ISchemeMobCombatState;

    // No guarantee that it was activated before so should be checked additionally.
    if (state !== null) {
      state.enabled = false;
    }
  }
}

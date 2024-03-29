import { AbstractScheme } from "@/engine/core/ai/scheme";
import { IRegistryObjectState, registry } from "@/engine/core/database";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/stalker/combat_ignore/combat_igore_types";
import { CombatProcessEnemyManager } from "@/engine/core/schemes/stalker/combat_ignore/CombatProcessEnemyManager";
import { EScheme, ESchemeType, GameObject, IniFile, Optional, TSection } from "@/engine/lib/types";

/**
 * Scheme describing stalker combat ignore state.
 * Activated when stalkers are on bases / processing quest events and should ignore combat.
 */
export class SchemeCombatIgnore extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.COMBAT_IGNORE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override disable(object: GameObject, scheme: EScheme): void {
    object.set_enemy_callback(null);

    const schemeState: Optional<ISchemeCombatIgnoreState> = registry.objects.get(object.id())[
      scheme
    ] as ISchemeCombatIgnoreState;

    if (schemeState !== null) {
      AbstractScheme.unsubscribe(schemeState, schemeState.action);
    }
  }

  public static override activate(object: GameObject, ini: IniFile, scheme: EScheme): ISchemeCombatIgnoreState {
    return AbstractScheme.assign(object, ini, scheme, null);
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCombatIgnoreState
  ): void {
    state.action = new CombatProcessEnemyManager(object, state);
  }

  public static override reset(
    object: GameObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    const schemeState: ISchemeCombatIgnoreState = state[SchemeCombatIgnore.SCHEME_SECTION] as ISchemeCombatIgnoreState;

    object.set_enemy_callback(schemeState.action.onObjectEnemy, schemeState.action);

    AbstractScheme.subscribe(schemeState, schemeState.action);

    schemeState.enabled = true;
    schemeState.overrides = state.overrides;
  }
}

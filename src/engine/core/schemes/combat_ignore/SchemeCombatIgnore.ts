import { IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes";
import { getObjectGenericSchemeOverrides } from "@/engine/core/schemes/base/utils/getObjectGenericSchemeOverrides";
import { CombatProcessEnemyManager } from "@/engine/core/schemes/combat_ignore/CombatProcessEnemyManager";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/combat_ignore/ISchemeCombatIgnoreState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo
 */
export class SchemeCombatIgnore extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.COMBAT_IGNORE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override disable(object: ClientObject, scheme: EScheme): void {
    object.set_enemy_callback(null);

    const schemeState: Optional<ISchemeCombatIgnoreState> = registry.objects.get(object.id())[
      scheme
    ] as ISchemeCombatIgnoreState;

    if (schemeState !== null) {
      SchemeCombatIgnore.unsubscribe(object, schemeState, schemeState.action);
    }
  }

  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme): void {
    AbstractScheme.assign(object, ini, scheme, null);
  }

  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCombatIgnoreState
  ): void {
    state.action = new CombatProcessEnemyManager(object, state);
  }

  public static override reset(
    object: ClientObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    const schemeState: ISchemeCombatIgnoreState = state[SchemeCombatIgnore.SCHEME_SECTION] as ISchemeCombatIgnoreState;

    object.set_enemy_callback(schemeState.action.onObjectEnemy, schemeState.action);

    SchemeCombatIgnore.subscribe(object, schemeState, schemeState.action);

    schemeState.enabled = true;
    schemeState.overrides = getObjectGenericSchemeOverrides(object);
  }
}

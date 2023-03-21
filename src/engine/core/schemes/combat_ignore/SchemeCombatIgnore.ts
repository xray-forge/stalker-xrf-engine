import { XR_game_object, XR_ini_file } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ActionProcessEnemy } from "@/engine/core/schemes/combat_ignore/actions/ActionProcessEnemy";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/combat_ignore/ISchemeCombatIgnoreState";
import { getObjectGenericSchemeOverrides } from "@/engine/core/schemes/utils/getObjectGenericSchemeOverrides";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo
 */
export class SchemeCombatIgnore extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.COMBAT_IGNORE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCombatIgnoreState
  ): void {
    state.action = new ActionProcessEnemy(object, state);
  }

  /**
   * todo
   */
  public static setCombatIgnoreChecker(object: XR_game_object, ini: XR_ini_file, scheme: EScheme): void {
    AbstractScheme.assignStateAndBind(object, ini, scheme, null);
  }

  /**
   * todo
   */
  public static override disableScheme(object: XR_game_object, scheme: EScheme): void {
    object.set_enemy_callback(null);

    const schemeState: Optional<ISchemeCombatIgnoreState> = registry.objects.get(object.id())[
      scheme
    ] as ISchemeCombatIgnoreState;

    if (schemeState !== null) {
      SchemeCombatIgnore.unsubscribeFromSchemaEvents(object, schemeState, schemeState.action);
    }
  }

  /**
   * todo
   */
  public static override resetScheme(
    object: XR_game_object,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    const schemeState: ISchemeCombatIgnoreState = state.combat_ignore as ISchemeCombatIgnoreState;

    object.set_enemy_callback(schemeState.action.enemy_callback, schemeState.action);

    SchemeCombatIgnore.subscribeToSchemaEvents(object, schemeState, schemeState.action);

    schemeState.overrides = getObjectGenericSchemeOverrides(object);
    schemeState.enabled = true;
  }
}

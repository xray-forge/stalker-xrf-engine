import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { IRegistryObjectState, registry } from "@/mod/scripts/core/database";
import { AbstractScheme } from "@/mod/scripts/core/scheme/base/AbstractScheme";
import { ActionProcessEnemy } from "@/mod/scripts/core/scheme/combat_ignore/actions/ActionProcessEnemy";
import { ISchemeCombatIgnoreState } from "@/mod/scripts/core/scheme/combat_ignore/ISchemeCombatIgnoreState";
import { generic_scheme_overrides } from "@/mod/scripts/core/scheme/generic_scheme_overrides";
import { subscribeActionForEvents } from "@/mod/scripts/core/scheme/subscribeActionForEvents";
import { unsubscribeActionFromEvents } from "@/mod/scripts/core/scheme/unsubscribeActionFromEvents";
import { LuaLogger } from "@/mod/scripts/utils/logging";

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
      unsubscribeActionFromEvents(object, schemeState, schemeState.action);
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
    const schemeState = state.combat_ignore as any;

    object.set_enemy_callback(schemeState.action.enemy_callback, schemeState.action);

    subscribeActionForEvents(object, schemeState, schemeState.action);

    schemeState.overrides = generic_scheme_overrides(object);
    schemeState.enabled = true;
  }
}

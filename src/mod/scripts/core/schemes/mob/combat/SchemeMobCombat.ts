import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { ISchemeMobCombatState } from "@/mod/scripts/core/schemes/mob/combat/ISchemeMobCombatState";
import { MobCombatManager } from "@/mod/scripts/core/schemes/mob/combat/MobCombatManager";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { getConfigSwitchConditions } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(FILENAME);

/**
 * todo
 */
export class SchemeMobCombat extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_COMBAT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMobCombatState
  ): void {
    const newAction: MobCombatManager = new MobCombatManager(object, state);

    state.action = newAction;

    subscribeActionForEvents(object, state, newAction);
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeMobCombatState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.enabled = true;
  }

  /**
   * todo;
   */
  public static override disableScheme(object: XR_game_object, scheme: EScheme): void {
    const state: Optional<ISchemeMobCombatState> = registry.objects.get(object.id())[scheme] as ISchemeMobCombatState;

    if (state !== null) {
      state.enabled = false;
    }
  }
}

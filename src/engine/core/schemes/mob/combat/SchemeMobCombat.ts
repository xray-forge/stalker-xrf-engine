import { XR_game_object, XR_ini_file } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes/base";
import { ISchemeMobCombatState } from "@/engine/core/schemes/mob/combat/ISchemeMobCombatState";
import { MobCombatManager } from "@/engine/core/schemes/mob/combat/MobCombatManager";
import { subscribeActionForEvents } from "@/engine/core/schemes/subscribeActionForEvents";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo
 */
export class SchemeMobCombat extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_COMBAT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  /**
   * todo: Description.
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
   * todo: Description.
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeMobCombatState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.enabled = true;
  }

  /**
   * todo: Description.
   */
  public static override disableScheme(object: XR_game_object, scheme: EScheme): void {
    const state: Optional<ISchemeMobCombatState> = registry.objects.get(object.id())[scheme] as ISchemeMobCombatState;

    if (state !== null) {
      state.enabled = false;
    }
  }
}

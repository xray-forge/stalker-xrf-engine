import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";
import { AbstractScheme } from "@/engine/scripts/core/schemes/base";
import { ISchemeMobDeathState } from "@/engine/scripts/core/schemes/mob/death/ISchemeMobDeathState";
import { MobDeathManager } from "@/engine/scripts/core/schemes/mob/death/MobDeathManager";
import { subscribeActionForEvents } from "@/engine/scripts/core/schemes/subscribeActionForEvents";
import { getConfigSwitchConditions } from "@/engine/scripts/utils/ini_config/config";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeMobDeath extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_DEATH;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMobDeathState
  ): void {
    subscribeActionForEvents(object, state, new MobDeathManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeMobDeathState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
  }
}

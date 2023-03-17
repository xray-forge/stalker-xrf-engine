import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";
import { AbstractScheme } from "@/engine/scripts/core/schemes/base";
import { getMobState } from "@/engine/scripts/core/schemes/mob/MobStateManager";
import { ISchemeMobWalkerState } from "@/engine/scripts/core/schemes/mob/walker/ISchemeMobWalkerState";
import { MobWalkerManager } from "@/engine/scripts/core/schemes/mob/walker/MobWalkerManager";
import { subscribeActionForEvents } from "@/engine/scripts/core/schemes/subscribeActionForEvents";
import { abort } from "@/engine/scripts/utils/debug";
import { getConfigSwitchConditions } from "@/engine/scripts/utils/ini_config/config";
import { getConfigBoolean, getConfigString } from "@/engine/scripts/utils/ini_config/getters";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeMobWalker extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_WALKER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMobWalkerState
  ): void {
    subscribeActionForEvents(object, state, new MobWalkerManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    gulag_name: string
  ): void {
    const state: ISchemeMobWalkerState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.state = getMobState(ini, section, object);
    state.no_reset = getConfigBoolean(ini, section, "no_reset", object, false);
    state.path_walk = getConfigString(ini, section, "path_walk", object, true, gulag_name);
    state.path_look = getConfigString(ini, section, "path_look", object, false, gulag_name);

    if (state.path_walk === state.path_look) {
      abort(
        "You are trying to set 'path_look' equal to 'path_walk' in section [%s] for npc [%s]",
        section,
        object.name()
      );
    }

    state.path_walk_info = null;
    state.path_look_info = null;
  }
}

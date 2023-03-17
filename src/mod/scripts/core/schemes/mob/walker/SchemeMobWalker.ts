import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { getMobState } from "@/mod/scripts/core/schemes/mob/MobStateManager";
import { ISchemeMobWalkerState } from "@/mod/scripts/core/schemes/mob/walker/ISchemeMobWalkerState";
import { MobWalkerManager } from "@/mod/scripts/core/schemes/mob/walker/MobWalkerManager";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { getConfigBoolean, getConfigString, getConfigSwitchConditions } from "@/mod/scripts/utils/config";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

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

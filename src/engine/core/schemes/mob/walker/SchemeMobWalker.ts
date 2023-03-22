import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base";
import { getMonsterState } from "@/engine/core/schemes/mob/MobStateManager";
import { ISchemeMobWalkerState } from "@/engine/core/schemes/mob/walker/ISchemeMobWalkerState";
import { MobWalkerManager } from "@/engine/core/schemes/mob/walker/MobWalkerManager";
import { abort } from "@/engine/core/utils/debug";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { readIniBoolean, readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeMobWalker extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_WALKER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  /**
   * todo: Description.
   */
  public static override activate(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    gulag_name: string
  ): void {
    const state: ISchemeMobWalkerState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.state = getMonsterState(ini, section);
    state.no_reset = readIniBoolean(ini, section, "no_reset", false);
    state.path_walk = readIniString(ini, section, "path_walk", true, gulag_name);
    state.path_look = readIniString(ini, section, "path_look", false, gulag_name);

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

  /**
   * todo: Description.
   */
  public static override add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMobWalkerState
  ): void {
    SchemeMobWalker.subscribe(object, state, new MobWalkerManager(object, state));
  }
}

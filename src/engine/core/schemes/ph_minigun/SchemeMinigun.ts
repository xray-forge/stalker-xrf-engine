import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base";
import { ISchemeMinigunState } from "@/engine/core/schemes/ph_minigun/ISchemeMinigunState";
import { MinigunManager } from "@/engine/core/schemes/ph_minigun/MinigunManager";
import { subscribeActionForEvents } from "@/engine/core/schemes/subscribeActionForEvents";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini_config/config";
import {
  getConfigBoolean,
  getConfigNumber,
  getConfigString,
  getConfigStringAndCondList,
} from "@/engine/core/utils/ini_config/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";

const def_fire_angle: number = 120;
const def_min_fire_time: number = 1.0;
const def_fire_rep: number = 0.5;
const def_fire_range: number = 50;

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeMinigun extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_MINIGUN;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMinigunState
  ): void {
    subscribeActionForEvents(object, state, new MinigunManager(object, state));
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
    const state: ISchemeMinigunState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.path_fire = getConfigString(ini, section, "path_fire", object, false, gulag_name, null);
    state.auto_fire = getConfigBoolean(ini, section, "auto_fire", object, false, false);
    state.fire_time = getConfigNumber(ini, section, "fire_time", object, false, def_min_fire_time);
    state.fire_rep = getConfigNumber(ini, section, "fire_repeat", object, false, def_fire_rep);
    state.fire_range = getConfigNumber(ini, section, "fire_range", object, false, def_fire_range);
    state.fire_target = getConfigString(ini, section, "target", object, false, gulag_name, "points");
    state.fire_track_target = getConfigBoolean(ini, section, "track_target", object, false, false);
    state.fire_angle = getConfigNumber(ini, section, "fire_angle", object, false, def_fire_angle);
    state.shoot_only_on_visible = getConfigBoolean(ini, section, "shoot_only_on_visible", object, false, true);
    state.on_target_vis = getConfigStringAndCondList(ini, section, "on_target_vis", object);
    state.on_target_nvis = getConfigStringAndCondList(ini, section, "on_target_nvis", object);
  }
}

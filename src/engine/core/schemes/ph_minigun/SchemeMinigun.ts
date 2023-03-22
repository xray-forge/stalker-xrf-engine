import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base";
import { ISchemeMinigunState } from "@/engine/core/schemes/ph_minigun/ISchemeMinigunState";
import { MinigunManager } from "@/engine/core/schemes/ph_minigun/MinigunManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import {
  getConfigStringAndCondList,
  readIniBoolean,
  readIniNumber,
  readIniString,
} from "@/engine/core/utils/ini/getters";
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
   * todo: Description.
   */
  public static override activate(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    additional: string
  ): void {
    const state: ISchemeMinigunState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.path_fire = readIniString(ini, section, "path_fire", false, additional, null);
    state.auto_fire = readIniBoolean(ini, section, "auto_fire", false, false);
    state.fire_time = readIniNumber(ini, section, "fire_time", false, def_min_fire_time);
    state.fire_rep = readIniNumber(ini, section, "fire_repeat", false, def_fire_rep);
    state.fire_range = readIniNumber(ini, section, "fire_range", false, def_fire_range);
    state.fire_target = readIniString(ini, section, "target", false, additional, "points");
    state.fire_track_target = readIniBoolean(ini, section, "track_target", false, false);
    state.fire_angle = readIniNumber(ini, section, "fire_angle", false, def_fire_angle);
    state.shoot_only_on_visible = readIniBoolean(ini, section, "shoot_only_on_visible", false, true);
    state.on_target_vis = getConfigStringAndCondList(ini, section, "on_target_vis");
    state.on_target_nvis = getConfigStringAndCondList(ini, section, "on_target_nvis");
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMinigunState
  ): void {
    SchemeMinigun.subscribe(object, state, new MinigunManager(object, state));
  }
}

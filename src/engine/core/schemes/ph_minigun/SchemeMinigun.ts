import { AbstractScheme } from "@/engine/core/schemes/base";
import { ISchemeMinigunState } from "@/engine/core/schemes/ph_minigun/ISchemeMinigunState";
import { MinigunManager } from "@/engine/core/schemes/ph_minigun/MinigunManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import {
  readIniBoolean,
  readIniNumber,
  readIniString,
  readIniStringAndCondList,
} from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const DEF_FIRE_ANGLE: number = 120;
const DEF_MIN_FIRE_TIME: number = 1.0;
const DEF_FIRE_REP: number = 0.5;
const DEF_FIRE_RANGE: number = 50;

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
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    additional: string
  ): void {
    const state: ISchemeMinigunState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.path_fire = readIniString(ini, section, "path_fire", false, additional, null);
    state.auto_fire = readIniBoolean(ini, section, "auto_fire", false, false);
    state.fire_time = readIniNumber(ini, section, "fire_time", false, DEF_MIN_FIRE_TIME);
    state.fire_rep = readIniNumber(ini, section, "fire_repeat", false, DEF_FIRE_REP);
    state.fire_range = readIniNumber(ini, section, "fire_range", false, DEF_FIRE_RANGE);
    state.fire_target = readIniString(ini, section, "target", false, additional, "points");
    state.fire_track_target = readIniBoolean(ini, section, "track_target", false, false);
    state.fire_angle = readIniNumber(ini, section, "fire_angle", false, DEF_FIRE_ANGLE);
    state.shoot_only_on_visible = readIniBoolean(ini, section, "shoot_only_on_visible", false, true);
    state.on_target_vis = readIniStringAndCondList(ini, section, "on_target_vis");
    state.on_target_nvis = readIniStringAndCondList(ini, section, "on_target_nvis");
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMinigunState
  ): void {
    SchemeMinigun.subscribe(object, state, new MinigunManager(object, state));
  }
}

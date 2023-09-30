import { AbstractScheme } from "@/engine/core/objects/ai/scheme";
import { MinigunManager } from "@/engine/core/schemes/physical/ph_minigun/MinigunManager";
import { ISchemeMinigunState } from "@/engine/core/schemes/physical/ph_minigun/ph_minigun_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import {
  readIniBoolean,
  readIniNumber,
  readIniString,
  readIniStringAndCondList,
} from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, TName, TSection } from "@/engine/lib/types";

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
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.OBJECT;

  public static override activate(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    smartTerrainName: TName
  ): ISchemeMinigunState {
    const state: ISchemeMinigunState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.pathFire = readIniString(ini, section, "path_fire", false, smartTerrainName);
    state.autoFire = readIniBoolean(ini, section, "auto_fire", false, false);
    state.fireTime = readIniNumber(ini, section, "fire_time", false, DEF_MIN_FIRE_TIME);
    state.fireRep = readIniNumber(ini, section, "fire_repeat", false, DEF_FIRE_REP);
    state.fireRange = readIniNumber(ini, section, "fire_range", false, DEF_FIRE_RANGE);
    state.fireTarget = readIniString(ini, section, "target", false, smartTerrainName, "points");
    state.fireTrackTarget = readIniBoolean(ini, section, "track_target", false, false);
    state.fireAngle = readIniNumber(ini, section, "fire_angle", false, DEF_FIRE_ANGLE);
    state.shootOnlyOnVisible = readIniBoolean(ini, section, "shoot_only_on_visible", false, true);
    state.onTargetVis = readIniStringAndCondList(ini, section, "on_target_vis");
    state.onTargetNvis = readIniStringAndCondList(ini, section, "on_target_nvis");

    return state;
  }

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

import { AbstractScheme } from "@/engine/core/ai/scheme";
import { minigunConfig } from "@/engine/core/schemes/physical/ph_minigun/MinigunConfig";
import { MinigunManager } from "@/engine/core/schemes/physical/ph_minigun/MinigunManager";
import { ISchemeMinigunState } from "@/engine/core/schemes/physical/ph_minigun/ph_minigun_types";
import {
  getConfigSwitchConditions,
  readIniBoolean,
  readIniNumber,
  readIniString,
  readIniStringAndCondList,
} from "@/engine/core/utils/ini";
import { EScheme, ESchemeType, GameObject, IniFile, TName, TSection } from "@/engine/lib/types";

/**
 * Scheme for physical objects defining minigun.
 * Example: gun in `escape` army post used to shoot at main hero.
 */
export class SchemeMinigun extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_MINIGUN;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.OBJECT;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    smartTerrainName: TName
  ): ISchemeMinigunState {
    const state: ISchemeMinigunState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.pathFire = readIniString(ini, section, "path_fire", false, smartTerrainName);
    state.autoFire = readIniBoolean(ini, section, "auto_fire", false, false);
    state.fireTime = readIniNumber(ini, section, "fire_time", false, minigunConfig.DEFAULT_MIN_FIRE_TIME);
    state.fireRep = readIniNumber(ini, section, "fire_repeat", false, minigunConfig.DEFAULT_FIRE_REP);
    state.fireRange = readIniNumber(ini, section, "fire_range", false, minigunConfig.DEFAULT_FIRE_RANGE);
    state.fireTarget = readIniString(ini, section, "target", false, smartTerrainName, "points");
    state.fireTrackTarget = readIniBoolean(ini, section, "track_target", false, false);
    state.fireAngle = readIniNumber(ini, section, "fire_angle", false, minigunConfig.DEFAULT_FIRE_ANGLE);
    state.shootOnlyOnVisible = readIniBoolean(ini, section, "shoot_only_on_visible", false, true);
    state.onTargetVis = readIniStringAndCondList(ini, section, "on_target_vis");
    state.onTargetNvis = readIniStringAndCondList(ini, section, "on_target_nvis");

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMinigunState
  ): void {
    AbstractScheme.subscribe(state, new MinigunManager(object, state));
  }
}

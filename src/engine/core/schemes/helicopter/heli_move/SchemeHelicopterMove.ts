import { AbstractScheme } from "@/engine/core/ai/scheme";
import { IRegistryObjectState, registry } from "@/engine/core/database";
import { ISchemeHelicopterMoveState } from "@/engine/core/schemes/helicopter/heli_move/helicopter_types";
import { HelicopterMoveManager } from "@/engine/core/schemes/helicopter/heli_move/HelicopterMoveManager";
import { getConfigSwitchConditions, readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini";
import { EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";

/**
 * Scheme describing helicopter movement over defined paths logics.
 */
export class SchemeHelicopterMove extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.HELI_MOVE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.HELICOPTER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeHelicopterMoveState {
    const state: ISchemeHelicopterMoveState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.pathMove = readIniString(ini, section, "path_move", true);
    state.pathLook = readIniString(ini, section, "path_look");
    state.enemyPreference = readIniString(ini, section, "enemy");
    state.firePoint = readIniString(ini, section, "fire_point");
    state.maxVelocity = readIniNumber(ini, section, "max_velocity", true);
    state.maxMinigunDistance = readIniNumber(ini, section, "max_mgun_attack_dist");
    state.maxRocketDistance = readIniNumber(ini, section, "max_rocket_attack_dist");
    state.minMinigunDistance = readIniNumber(ini, section, "min_mgun_attack_dist");
    state.minRocketDistance = readIniNumber(ini, section, "min_rocket_attack_dist");
    state.updVis = readIniNumber(ini, section, "upd_vis", false, 10);
    state.isRocketEnabled = readIniBoolean(ini, section, "use_rocket", false, true);
    state.isMinigunEnabled = readIniBoolean(ini, section, "use_mgun", false, true);
    state.isEngineSoundEnabled = readIniBoolean(ini, section, "engine_sound", false, true);
    state.stopFire = readIniBoolean(ini, section, "stop_fire", false, false);
    state.showHealth = readIniBoolean(ini, section, "show_health", false, false);
    state.fireTrail = readIniBoolean(ini, section, "fire_trail", false, false);

    const objectState: IRegistryObjectState = registry.objects.get(object.id());

    objectState.invulnerable = readIniBoolean(ini, section, "invulnerable", false, false);
    objectState.immortal = readIniBoolean(ini, section, "immortal", false, false);
    objectState.mute = readIniBoolean(ini, section, "mute", false, false);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeHelicopterMoveState
  ): void {
    AbstractScheme.subscribe(state, new HelicopterMoveManager(object, state));
  }
}

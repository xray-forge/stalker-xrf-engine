import { IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { HelicopterMoveManager } from "@/engine/core/schemes/heli_move/HelicopterMoveManager";
import { ISchemeHelicopterMoveState } from "@/engine/core/schemes/heli_move/ISchemeHelicopterMoveState";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo
 */
export class SchemeHelicopterMove extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.HELI_MOVE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  /**
   * todo
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    const state: ISchemeHelicopterMoveState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.path_move = readIniString(ini, section, "path_move", true, "");
    state.path_look = readIniString(ini, section, "path_look", false, "");
    state.enemy_ = readIniString(ini, section, "enemy", false, "");
    state.fire_point = readIniString(ini, section, "fire_point", false, "");
    state.max_velocity = readIniNumber(ini, section, "max_velocity", true, null) as number; // todo: Assert?
    state.max_mgun_dist = readIniNumber(ini, section, "max_mgun_attack_dist", false);
    state.max_rocket_dist = readIniNumber(ini, section, "max_rocket_attack_dist", false);
    state.min_mgun_dist = readIniNumber(ini, section, "min_mgun_attack_dist", false);
    state.min_rocket_dist = readIniNumber(ini, section, "min_rocket_attack_dist", false);
    state.upd_vis = readIniNumber(ini, section, "upd_vis", false, 10);
    state.use_rocket = readIniBoolean(ini, section, "use_rocket", false, true);
    state.use_mgun = readIniBoolean(ini, section, "use_mgun", false, true);
    state.engine_sound = readIniBoolean(ini, section, "engine_sound", false, true);
    state.stop_fire = readIniBoolean(ini, section, "stop_fire", false, false);
    state.show_health = readIniBoolean(ini, section, "show_health", false, false);
    state.fire_trail = readIniBoolean(ini, section, "fire_trail", false, false);

    const objectState: IRegistryObjectState = registry.objects.get(object.id());

    objectState.invulnerable = readIniBoolean(ini, section, "invulnerable", false, false);
    objectState.immortal = readIniBoolean(ini, section, "immortal", false, false);
    objectState.mute = readIniBoolean(ini, section, "mute", false, false);
  }

  /**
   * todo
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeHelicopterMoveState
  ): void {
    SchemeHelicopterMove.subscribe(object, state, new HelicopterMoveManager(object, state));
  }
}

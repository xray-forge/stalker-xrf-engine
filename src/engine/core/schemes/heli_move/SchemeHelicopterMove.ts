import { XR_game_object, XR_ini_file } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { HelicopterMoveManager } from "@/engine/core/schemes/heli_move/HelicopterMoveManager";
import { ISchemeHelicopterMoveState } from "@/engine/core/schemes/heli_move/ISchemeHelicopterMoveState";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { getConfigBoolean, getConfigNumber, getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";

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
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeHelicopterMoveState
  ): void {
    SchemeHelicopterMove.subscribeToSchemaEvents(object, state, new HelicopterMoveManager(object, state));
  }

  /**
   * todo
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeHelicopterMoveState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.path_move = getConfigString(ini, section, "path_move", object, true, "");
    state.path_look = getConfigString(ini, section, "path_look", object, false, "");
    state.enemy_ = getConfigString(ini, section, "enemy", object, false, "");
    state.fire_point = getConfigString(ini, section, "fire_point", object, false, "");
    state.max_velocity = getConfigNumber(ini, section, "max_velocity", object, true, null) as number; // todo: Assert?
    state.max_mgun_dist = getConfigNumber(ini, section, "max_mgun_attack_dist", object, false);
    state.max_rocket_dist = getConfigNumber(ini, section, "max_rocket_attack_dist", object, false);
    state.min_mgun_dist = getConfigNumber(ini, section, "min_mgun_attack_dist", object, false);
    state.min_rocket_dist = getConfigNumber(ini, section, "min_rocket_attack_dist", object, false);
    state.upd_vis = getConfigNumber(ini, section, "upd_vis", object, false, 10);
    state.use_rocket = getConfigBoolean(ini, section, "use_rocket", object, false, true);
    state.use_mgun = getConfigBoolean(ini, section, "use_mgun", object, false, true);
    state.engine_sound = getConfigBoolean(ini, section, "engine_sound", object, false, true);
    state.stop_fire = getConfigBoolean(ini, section, "stop_fire", object, false, false);
    state.show_health = getConfigBoolean(ini, section, "show_health", object, false, false);
    state.fire_trail = getConfigBoolean(ini, section, "fire_trail", object, false, false);

    const objectState: IRegistryObjectState = registry.objects.get(object.id());

    objectState.invulnerable = getConfigBoolean(ini, section, "invulnerable", object, false, false);
    objectState.immortal = getConfigBoolean(ini, section, "immortal", object, false, false);
    objectState.mute = getConfigBoolean(ini, section, "mute", object, false, false);
  }
}

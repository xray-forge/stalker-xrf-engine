import { XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes/base";
import { DeimosManager } from "@/engine/core/schemes/sr_deimos/DeimosManager";
import { ISchemeDeimosState } from "@/engine/core/schemes/sr_deimos/ISchemeDeimosState";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { getConfigNumber, getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TRate, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * Scheme only for 1 quest in the end of game? (pri_a28_sr_horror)
 */
export class SchemeDeimos extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_DEIMOS;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo: Description.
   */
  public static override activate(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeDeimosState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.movement_speed = getConfigNumber(ini, section, "movement_speed", false, 100);
    state.growing_koef = getConfigNumber(ini, section, "growing_koef", false, 0.1);
    state.lowering_koef = getConfigNumber(ini, section, "lowering_koef", false, state.growing_koef);
    state.pp_effector = getConfigString(ini, section, "pp_effector", false, null);
    state.cam_effector = getConfigString(ini, section, "cam_effector", false, "");
    state.pp_effector2 = getConfigString(ini, section, "pp_effector2", false, "");
    state.cam_effector_repeating_time = getConfigNumber(ini, section, "cam_effector_repeating_time", false, 10) * 1000;
    state.noise_sound = getConfigString(ini, section, "noise_sound", false, "");
    state.heartbeet_sound = getConfigString(ini, section, "heartbeet_sound", false, "");
    state.health_lost = getConfigNumber(ini, section, "health_lost", false, 0.01);
    state.disable_bound = getConfigNumber(ini, section, "disable_bound", false, 0.1);
    state.switch_lower_bound = getConfigNumber(ini, section, "switch_lower_bound", false, 0.5);
    state.switch_upper_bound = getConfigNumber(ini, section, "switch_upper_bound", false, 0.75);
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeDeimosState
  ): void {
    SchemeDeimos.subscribe(object, state, new DeimosManager(object, state));
  }

  /**
   * todo: Description.
   */
  public static checkIntensityDelta(state: IRegistryObjectState): boolean {
    if (state.active_scheme === SchemeDeimos.SCHEME_SECTION) {
      const deimosState: ISchemeDeimosState = state[state.active_scheme] as ISchemeDeimosState;
      const speedVector: XR_vector = registry.actor.get_movement_speed();
      const currentSpeed: TRate = math.sqrt(
        speedVector.x * speedVector.x + speedVector.y * speedVector.y + speedVector.z * speedVector.z
      );
      const intensityDelta: TRate = deimosState.growing_koef * (deimosState.movement_speed - currentSpeed) * 0.005;

      return intensityDelta < 0;
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public static checkDisableBound(state: IRegistryObjectState): boolean {
    if (state.active_scheme === SchemeDeimos.SCHEME_SECTION) {
      const deimosState: ISchemeDeimosState = state[state.active_scheme] as ISchemeDeimosState;

      return deimosState.intensity < deimosState.disable_bound;
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public static checkLowerBound(state: IRegistryObjectState): boolean {
    if (state.active_scheme === SchemeDeimos.SCHEME_SECTION) {
      const deimosState: ISchemeDeimosState = state[state.active_scheme] as ISchemeDeimosState;

      return deimosState.intensity < deimosState.switch_lower_bound;
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public static checkUpperBound(state: IRegistryObjectState): boolean {
    if (state.active_scheme === SchemeDeimos.SCHEME_SECTION) {
      const deimosState: ISchemeDeimosState = state[state.active_scheme] as ISchemeDeimosState;

      return deimosState.intensity < deimosState.switch_upper_bound;
    }

    return false;
  }
}

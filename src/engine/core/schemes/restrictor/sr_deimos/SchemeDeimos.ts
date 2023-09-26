import { IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/objects/ai/scheme";
import { DeimosManager } from "@/engine/core/schemes/restrictor/sr_deimos/DeimosManager";
import { ISchemeDeimosState } from "@/engine/core/schemes/restrictor/sr_deimos/ISchemeDeimosState";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, TRate, TSection, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * Scheme only for 1 quest in the end of game? (pri_a28_sr_horror)
 */
export class SchemeDeimos extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_DEIMOS;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static override activate(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeDeimosState {
    const state: ISchemeDeimosState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.movement_speed = readIniNumber(ini, section, "movement_speed", false, 100);
    state.growing_koef = readIniNumber(ini, section, "growing_koef", false, 0.1);
    state.lowering_koef = readIniNumber(ini, section, "lowering_koef", false, state.growing_koef);
    state.pp_effector = readIniString(ini, section, "pp_effector", false, null);
    state.cam_effector = readIniString(ini, section, "cam_effector", false);
    state.pp_effector2 = readIniString(ini, section, "pp_effector2", false);
    state.cam_effector_repeating_time = readIniNumber(ini, section, "cam_effector_repeating_time", false, 10) * 1000;
    state.noise_sound = readIniString(ini, section, "noise_sound", false);
    state.heartbeet_sound = readIniString(ini, section, "heartbeet_sound", false);
    state.health_lost = readIniNumber(ini, section, "health_lost", false, 0.01);
    state.disable_bound = readIniNumber(ini, section, "disable_bound", false, 0.1);
    state.switch_lower_bound = readIniNumber(ini, section, "switch_lower_bound", false, 0.5);
    state.switch_upper_bound = readIniNumber(ini, section, "switch_upper_bound", false, 0.75);

    return state;
  }

  public static override add(
    object: ClientObject,
    ini: IniFile,
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
    if (state.activeScheme === SchemeDeimos.SCHEME_SECTION) {
      const deimosState: ISchemeDeimosState = state[state.activeScheme] as ISchemeDeimosState;
      const speedVector: Vector = registry.actor.get_movement_speed();
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
    if (state.activeScheme === SchemeDeimos.SCHEME_SECTION) {
      const deimosState: ISchemeDeimosState = state[state.activeScheme] as ISchemeDeimosState;

      return deimosState.intensity < deimosState.disable_bound;
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public static checkLowerBound(state: IRegistryObjectState): boolean {
    if (state.activeScheme === SchemeDeimos.SCHEME_SECTION) {
      const deimosState: ISchemeDeimosState = state[state.activeScheme] as ISchemeDeimosState;

      return deimosState.intensity < deimosState.switch_lower_bound;
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public static checkUpperBound(state: IRegistryObjectState): boolean {
    if (state.activeScheme === SchemeDeimos.SCHEME_SECTION) {
      const deimosState: ISchemeDeimosState = state[state.activeScheme] as ISchemeDeimosState;

      return deimosState.intensity < deimosState.switch_upper_bound;
    }

    return false;
  }
}

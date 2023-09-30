import { IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/objects/ai/scheme";
import { DeimosManager } from "@/engine/core/schemes/restrictor/sr_deimos/DeimosManager";
import { ISchemeDeimosState } from "@/engine/core/schemes/restrictor/sr_deimos/sr_deimos_types";
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
    state.movementSpeed = readIniNumber(ini, section, "movement_speed", false, 100);
    state.growingKoef = readIniNumber(ini, section, "growing_koef", false, 0.1);
    state.loweringKoef = readIniNumber(ini, section, "lowering_koef", false, state.growingKoef);
    state.ppEffector = readIniString(ini, section, "pp_effector", false, null);
    state.camEffector = readIniString(ini, section, "cam_effector", false);
    state.ppEffector2 = readIniString(ini, section, "pp_effector2", false);
    state.camEffectorRepeatingTime = readIniNumber(ini, section, "cam_effector_repeating_time", false, 10) * 1000;
    state.noiseSound = readIniString(ini, section, "noise_sound", false);
    state.heartbeetSound = readIniString(ini, section, "heartbeet_sound", false);
    state.healthLost = readIniNumber(ini, section, "health_lost", false, 0.01);
    state.disableBound = readIniNumber(ini, section, "disable_bound", false, 0.1);
    state.switchLowerBound = readIniNumber(ini, section, "switch_lower_bound", false, 0.5);
    state.switchUpperBound = readIniNumber(ini, section, "switch_upper_bound", false, 0.75);

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
      const intensityDelta: TRate = deimosState.growingKoef * (deimosState.movementSpeed - currentSpeed) * 0.005;

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

      return deimosState.intensity < deimosState.disableBound;
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public static checkLowerBound(state: IRegistryObjectState): boolean {
    if (state.activeScheme === SchemeDeimos.SCHEME_SECTION) {
      const deimosState: ISchemeDeimosState = state[state.activeScheme] as ISchemeDeimosState;

      return deimosState.intensity < deimosState.switchLowerBound;
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public static checkUpperBound(state: IRegistryObjectState): boolean {
    if (state.activeScheme === SchemeDeimos.SCHEME_SECTION) {
      const deimosState: ISchemeDeimosState = state[state.activeScheme] as ISchemeDeimosState;

      return deimosState.intensity < deimosState.switchUpperBound;
    }

    return false;
  }
}

import { AbstractScheme } from "@/engine/core/ai/scheme";
import { DeimosManager } from "@/engine/core/schemes/restrictor/sr_deimos/DeimosManager";
import { ISchemeDeimosState } from "@/engine/core/schemes/restrictor/sr_deimos/sr_deimos_types";
import { getConfigSwitchConditions, readIniNumber, readIniString } from "@/engine/core/utils/ini";
import { EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";

/**
 * todo;
 * todo;
 * Scheme only for 1 quest in the end of game? (pri_a28_sr_horror)
 */
export class SchemeDeimos extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_DEIMOS;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeDeimosState {
    const state: ISchemeDeimosState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.movementSpeed = readIniNumber(ini, section, "movement_speed", false, 100);
    state.growingRate = readIniNumber(ini, section, "growing_rate", false, 0.1);
    state.loweringRate = readIniNumber(ini, section, "lowering_rate", false, state.growingRate);
    state.ppEffector = readIniString(ini, section, "pp_effector", true);
    state.ppEffector2 = readIniString(ini, section, "pp_effector2", true);
    state.camEffector = readIniString(ini, section, "cam_effector", true);
    state.camEffectorRepeatingTime = readIniNumber(ini, section, "cam_effector_repeating_time", false, 10) * 1000;
    state.noiseSound = readIniString(ini, section, "noise_sound", true);
    state.heartbeatSound = readIniString(ini, section, "heartbeat_sound", true);
    state.healthLost = readIniNumber(ini, section, "health_lost", false, 0.01);
    state.disableBound = readIniNumber(ini, section, "disable_bound", false, 0.1);
    state.switchLowerBound = readIniNumber(ini, section, "switch_lower_bound", false, 0.5);
    state.switchUpperBound = readIniNumber(ini, section, "switch_upper_bound", false, 0.75);
    state.intensity = 0;

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeDeimosState
  ): void {
    AbstractScheme.subscribe(state, new DeimosManager(object, state));
  }
}

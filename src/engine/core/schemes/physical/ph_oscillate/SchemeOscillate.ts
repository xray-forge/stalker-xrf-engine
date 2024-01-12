import { AbstractScheme } from "@/engine/core/ai/scheme/AbstractScheme";
import { OscillateManager } from "@/engine/core/schemes/physical/ph_oscillate/OscillateManager";
import { ISchemeOscillateState } from "@/engine/core/schemes/physical/ph_oscillate/ph_oscillate_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { EScheme, ESchemeType, GameObject, IniFile, TName, TSection } from "@/engine/lib/types";

/**
 * Scheme implementing logics of oscillation of physical objects with some period of time.
 */
export class SchemeOscillate extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_OSCILLATE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.OBJECT;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    smartTerrainName: TName
  ): ISchemeOscillateState {
    const state: ISchemeOscillateState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.joint = readIniString(ini, section, "joint", true, smartTerrainName);
    state.period = readIniNumber(ini, section, "period", true);
    state.force = readIniNumber(ini, section, "force", true);
    state.angle = readIniNumber(ini, section, "correct_angle", false, 0);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeOscillateState
  ): void {
    AbstractScheme.subscribe(state, new OscillateManager(object, state));
  }
}

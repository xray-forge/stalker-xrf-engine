import { AbstractScheme } from "@/engine/core/objects/ai/scheme/AbstractScheme";
import { OscillateManager } from "@/engine/core/schemes/physical/ph_oscillate/OscillateManager";
import { ISchemeOscillateState } from "@/engine/core/schemes/physical/ph_oscillate/ph_oscillate_types";
import { abort } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, GameObject, IniFile, TName, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme to oscillate physical objects with some period of time.
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

    if (state.joint === null) {
      abort("Invalid joint definition for object %s", object.name());
    }

    state.period = readIniNumber(ini, section, "period", true, 0);
    state.force = readIniNumber(ini, section, "force", true, 0);

    // todo: is real with 0s as default values?
    if (state.period === null || state.force === null) {
      abort("[ActionOscillate] Error : Force or period not defined");
    }

    state.angle = readIniNumber(ini, section, "correct_angle", false, 0);

    // todo: is real with 0s as default values?
    if (state.angle === null) {
      state.angle = 0;
    }

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeOscillateState
  ): void {
    AbstractScheme.subscribe(object, state, new OscillateManager(object, state));
  }
}

import { AbstractScheme } from "@/engine/core/objects/ai/scheme/AbstractScheme";
import { PsyAntennaSchemaManager } from "@/engine/core/schemes/restrictor/sr_psy_antenna/PsyAntennaSchemaManager";
import { ISchemePsyAntennaState } from "@/engine/core/schemes/restrictor/sr_psy_antenna/sr_psy_antenna_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { postProcessors } from "@/engine/lib/constants/animation";
import { ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemePsyAntenna extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_PSY_ANTENNA;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static override activate(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemePsyAntennaState {
    const state: ISchemePsyAntennaState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.intensity = readIniNumber(ini, section, "eff_intensity", true) * 0.01;
    state.postprocess = readIniString(ini, section, "postprocess", false, null, postProcessors.psy_antenna);
    state.hitIntensity = readIniNumber(ini, section, "hit_intensity", true) * 0.01;
    state.phantomProb = readIniNumber(ini, section, "phantom_prob", false, 0) * 0.01;
    state.muteSoundThreshold = readIniNumber(ini, section, "mute_sound_threshold", false, 0);
    state.noStatic = readIniBoolean(ini, section, "no_static", false, false);
    state.noMumble = readIniBoolean(ini, section, "no_mumble", false, false);
    state.hitType = readIniString(ini, section, "hit_type", false, null, "wound");
    state.hitFreq = readIniNumber(ini, section, "hit_freq", false, 5000);

    return state;
  }

  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemePsyAntennaState
  ): void {
    AbstractScheme.subscribe(object, state, new PsyAntennaSchemaManager(object, state));
  }
}

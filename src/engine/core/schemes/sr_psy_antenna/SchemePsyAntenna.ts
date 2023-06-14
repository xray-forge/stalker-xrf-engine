import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ISchemePsyAntennaState } from "@/engine/core/schemes/sr_psy_antenna/ISchemePsyAntennaState";
import { PsyAntennaSchemaManager } from "@/engine/core/schemes/sr_psy_antenna/PsyAntennaSchemaManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { postProcessors } from "@/engine/lib/constants/animation/post_processors";
import { ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemePsyAntenna extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_PSY_ANTENNA;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo: Description.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    const state: ISchemePsyAntennaState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.intensity = readIniNumber(ini, section, "eff_intensity", true) * 0.01;
    state.postprocess = readIniString(ini, section, "postprocess", false, "", postProcessors.psy_antenna);
    state.hit_intensity = readIniNumber(ini, section, "hit_intensity", true) * 0.01;
    state.phantom_prob = readIniNumber(ini, section, "phantom_prob", false, 0) * 0.01;
    state.mute_sound_threshold = readIniNumber(ini, section, "mute_sound_threshold", false, 0);
    state.no_static = readIniBoolean(ini, section, "no_static", false, false);
    state.no_mumble = readIniBoolean(ini, section, "no_mumble", false, false);
    state.hit_type = readIniString(ini, section, "hit_type", false, "", "wound");
    state.hit_freq = readIniNumber(ini, section, "hit_freq", false, 5000);
  }

  /**
   * Add scheme to object binder for initialization.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemePsyAntennaState
  ): void {
    SchemePsyAntenna.subscribe(object, state, new PsyAntennaSchemaManager(object, state));
  }
}

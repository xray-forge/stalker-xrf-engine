import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ISchemePsyAntennaState } from "@/engine/core/schemes/sr_psy_antenna/ISchemePsyAntennaState";
import { PsyAntennaSchemaManager } from "@/engine/core/schemes/sr_psy_antenna/PsyAntennaSchemaManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { getConfigBoolean, getConfigNumber, getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { postProcessors } from "@/engine/lib/constants/animation/post_processors";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";

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
  public static override activate(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemePsyAntennaState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.intensity = getConfigNumber(ini, section, "eff_intensity", object, true) * 0.01;
    state.postprocess = getConfigString(ini, section, "postprocess", object, false, "", postProcessors.psy_antenna);
    state.hit_intensity = getConfigNumber(ini, section, "hit_intensity", object, true) * 0.01;
    state.phantom_prob = getConfigNumber(ini, section, "phantom_prob", object, false, 0) * 0.01;
    state.mute_sound_threshold = getConfigNumber(ini, section, "mute_sound_threshold", object, false, 0);
    state.no_static = getConfigBoolean(ini, section, "no_static", object, false, false);
    state.no_mumble = getConfigBoolean(ini, section, "no_mumble", object, false, false);
    state.hit_type = getConfigString(ini, section, "hit_type", object, false, "", "wound");
    state.hit_freq = getConfigNumber(ini, section, "hit_freq", object, false, 5000);
  }

  /**
   * Add scheme to object binder for initialization.
   */
  public static override add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemePsyAntennaState
  ): void {
    SchemePsyAntenna.subscribe(object, state, new PsyAntennaSchemaManager(object, state));
  }
}

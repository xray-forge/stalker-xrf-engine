import { XR_game_object, XR_ini_file } from "xray16";

import { post_processors } from "@/mod/globals/animation/post_processors";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { ISchemePsyAntennaState } from "@/mod/scripts/core/schemes/sr_psy_antenna/ISchemePsyAntennaState";
import { PsyAntennaSchemaManager } from "@/mod/scripts/core/schemes/sr_psy_antenna/PsyAntennaSchemaManager";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import {
  getConfigBoolean,
  getConfigNumber,
  getConfigString,
  getConfigSwitchConditions,
} from "@/mod/scripts/utils/config";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemePsyAntenna extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_PSY_ANTENNA;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * Add scheme to object binder for initialization.
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemePsyAntennaState
  ): void {
    subscribeActionForEvents(object, state, new PsyAntennaSchemaManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemePsyAntennaState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.intensity = getConfigNumber(ini, section, "eff_intensity", object, true) * 0.01;
    state.postprocess = getConfigString(ini, section, "postprocess", object, false, "", post_processors.psy_antenna);
    state.hit_intensity = getConfigNumber(ini, section, "hit_intensity", object, true) * 0.01;
    state.phantom_prob = getConfigNumber(ini, section, "phantom_prob", object, false, 0) * 0.01;
    state.mute_sound_threshold = getConfigNumber(ini, section, "mute_sound_threshold", object, false, 0);
    state.no_static = getConfigBoolean(ini, section, "no_static", object, false, false);
    state.no_mumble = getConfigBoolean(ini, section, "no_mumble", object, false, false);
    state.hit_type = getConfigString(ini, section, "hit_type", object, false, "", "wound");
    state.hit_freq = getConfigNumber(ini, section, "hit_freq", object, false, 5000);
  }
}

import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TName, TSection } from "@/engine/lib/types";
import { AbstractScheme } from "@/engine/scripts/core/schemes/base";
import { ISchemeParticleState } from "@/engine/scripts/core/schemes/sr_particle/ISchemeParticleState";
import { ParticleManager } from "@/engine/scripts/core/schemes/sr_particle/ParticleManager";
import { subscribeActionForEvents } from "@/engine/scripts/core/schemes/subscribeActionForEvents";
import { abort } from "@/engine/scripts/utils/debug";
import { getConfigSwitchConditions } from "@/engine/scripts/utils/ini_config/config";
import { getConfigBoolean, getConfigNumber, getConfigString } from "@/engine/scripts/utils/ini_config/getters";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeParticle extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_PARTICLE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeParticleState
  ): void {
    subscribeActionForEvents(object, state, new ParticleManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeParticleState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.name = getConfigString(ini, section, "name", object, true, "", null) as TName;
    state.path = getConfigString(ini, section, "path", object, true, "", null) as TName;
    state.mode = getConfigNumber(ini, section, "mode", object, true);
    state.looped = getConfigBoolean(ini, section, "looped", object, false);

    if (state.path === null || state.path === "") {
      abort("SR_PARTICLE : invalid path name");
    }

    if (state.mode !== 1 && state.mode !== 2) {
      abort("SR_PARTICLE : invalid mode");
    }
  }
}

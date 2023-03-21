import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base";
import { ISchemeParticleState } from "@/engine/core/schemes/sr_particle/ISchemeParticleState";
import { ParticleManager } from "@/engine/core/schemes/sr_particle/ParticleManager";
import { abort } from "@/engine/core/utils/debug";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { getConfigBoolean, getConfigNumber, getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TName, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeParticle extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_PARTICLE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo: Description.
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeParticleState
  ): void {
    SchemeParticle.subscribeToSchemaEvents(object, state, new ParticleManager(object, state));
  }

  /**
   * todo: Description.
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

import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base";
import { ISchemeParticleState } from "@/engine/core/schemes/sr_particle/ISchemeParticleState";
import { ParticleManager } from "@/engine/core/schemes/sr_particle/ParticleManager";
import { abort } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/getters";
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
  public static override activate(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeParticleState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.name = readIniString(ini, section, "name", true, "", null) as TName;
    state.path = readIniString(ini, section, "path", true, "", null) as TName;
    state.mode = readIniNumber(ini, section, "mode", true);
    state.looped = readIniBoolean(ini, section, "looped", false);

    if (state.path === null || state.path === "") {
      abort("SR_PARTICLE : invalid path name");
    }

    if (state.mode !== 1 && state.mode !== 2) {
      abort("SR_PARTICLE : invalid mode");
    }
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeParticleState
  ): void {
    SchemeParticle.subscribe(object, state, new ParticleManager(object, state));
  }
}
import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base";
import { ISchemePostProcessState } from "@/engine/core/schemes/sr_postprocess/ISchemePostProcessState";
import { SchemePostProcessManager } from "@/engine/core/schemes/sr_postprocess/SchemePostProcessManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { readIniNumber } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemePostProcess extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_POSTPROCESS;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo: Description.
   */
  public static override activate(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemePostProcessState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.intensity = readIniNumber(ini, section, "intensity", true) * 0.01;
    state.intensity_speed = readIniNumber(ini, section, "intensity_speed", true) * 0.01;
    state.hit_intensity = readIniNumber(ini, section, "hit_intensity", true);
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemePostProcessState
  ): void {
    SchemePostProcess.subscribe(object, state, new SchemePostProcessManager(object, state));
  }
}

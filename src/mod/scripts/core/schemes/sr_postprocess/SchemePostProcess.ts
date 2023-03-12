import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { ISchemePostProcessState } from "@/mod/scripts/core/schemes/sr_postprocess/ISchemePostProcessState";
import { SchemePostProcessManager } from "@/mod/scripts/core/schemes/sr_postprocess/SchemePostProcessManager";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { getConfigNumber, getConfigSwitchConditions } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(FILENAME);

/**
 * todo;
 */
export class SchemePostProcess extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_POSTPROCESS;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemePostProcessState
  ): void {
    subscribeActionForEvents(object, state, new SchemePostProcessManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemePostProcessState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.intensity = getConfigNumber(ini, section, "intensity", object, true) * 0.01;
    state.intensity_speed = getConfigNumber(ini, section, "intensity_speed", object, true) * 0.01;
    state.hit_intensity = getConfigNumber(ini, section, "hit_intensity", object, true);
  }
}

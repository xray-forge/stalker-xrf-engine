import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";
import { AbstractScheme } from "@/engine/scripts/core/schemes/base";
import { ISchemePostProcessState } from "@/engine/scripts/core/schemes/sr_postprocess/ISchemePostProcessState";
import { SchemePostProcessManager } from "@/engine/scripts/core/schemes/sr_postprocess/SchemePostProcessManager";
import { subscribeActionForEvents } from "@/engine/scripts/core/schemes/subscribeActionForEvents";
import { getConfigNumber, getConfigSwitchConditions } from "@/engine/scripts/utils/config";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

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

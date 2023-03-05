import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TName, TSection } from "@/mod/lib/types";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { ISchemeOscillateState } from "@/mod/scripts/core/schemes/ph_oscillate/ISchemeOscillateState";
import { OscillateManager } from "@/mod/scripts/core/schemes/ph_oscillate/OscillateManager";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { getConfigNumber, getConfigString, getConfigSwitchConditions } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeOscillate");

/**
 * todo;
 */
export class SchemeOscillate extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_OSCILLATE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeOscillateState
  ): void {
    logger.info("Add to binder:", object.name());
    subscribeActionForEvents(object, state, new OscillateManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    gulagName: TName
  ): void {
    const state: ISchemeOscillateState = assignStorageAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.joint = getConfigString(ini, section, "joint", object, true, gulagName);

    if (state.joint === null) {
      abort("Invalid joint definition for object %s", object.name());
    }

    state.period = getConfigNumber(ini, section, "period", object, true, 0);
    state.force = getConfigNumber(ini, section, "force", object, true, 0);

    // todo: is real with 0s as default values?
    if (state.period === null || state.force === null) {
      abort("[ActionOscillate] Error : Force or period not defined");
    }

    state.angle = getConfigNumber(ini, section, "correct_angle", object, false, 0);

    // todo: is real with 0s as default values?
    if (state.angle === null) {
      state.angle = 0;
    }
  }
}

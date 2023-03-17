import { patrol, XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";
import { AbstractScheme } from "@/engine/scripts/core/schemes/base";
import { ISchemePhysicalForceState } from "@/engine/scripts/core/schemes/ph_force/ISchemePhysicalForceState";
import { PhysicalForceManager } from "@/engine/scripts/core/schemes/ph_force/PhysicalForceManager";
import { subscribeActionForEvents } from "@/engine/scripts/core/schemes/subscribeActionForEvents";
import { getConfigNumber, getConfigString, getConfigSwitchConditions } from "@/engine/scripts/utils/config";
import { abort } from "@/engine/scripts/utils/debug";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemePhysicalForce extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_FORCE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemePhysicalForceState
  ): void {
    subscribeActionForEvents(object, state, new PhysicalForceManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemePhysicalForceState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.force = getConfigNumber(ini, section, "force", object, true, 0);
    state.time = getConfigNumber(ini, section, "time", object, true, 0);
    state.delay = getConfigNumber(ini, section, "delay", object, false, 0);

    const path_name = getConfigString(ini, section, "point", object, true, "");
    const index = getConfigNumber(ini, section, "point_index", object, false, 0);

    if (state.force === null || state.force <= 0) {
      abort("PH_FORCE : invalid force !");
    }

    if (state.time === null || state.time <= 0) {
      abort("PH_FORCE : invalid time !");
    }

    if (path_name === null || path_name === "") {
      abort("PH_FORCE : invalid waypoint name !");
    }

    const path = new patrol(path_name);

    if (index >= path.count()) {
      abort("PH_FORCE : invalid waypoint index.ts !");
    }

    state.point = path.point(index);
  }
}

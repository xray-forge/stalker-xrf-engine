import { patrol } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base";
import { ISchemePhysicalForceState } from "@/engine/core/schemes/ph_force/ISchemePhysicalForceState";
import { PhysicalForceManager } from "@/engine/core/schemes/ph_force/PhysicalForceManager";
import { abort } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemePhysicalForce extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_FORCE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  /**
   * todo: Description.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    const state: ISchemePhysicalForceState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.force = readIniNumber(ini, section, "force", true, 0);
    state.time = readIniNumber(ini, section, "time", true, 0);
    state.delay = readIniNumber(ini, section, "delay", false, 0);

    const path_name = readIniString(ini, section, "point", true, "");
    const index = readIniNumber(ini, section, "point_index", false, 0);

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

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemePhysicalForceState
  ): void {
    AbstractScheme.subscribe(object, state, new PhysicalForceManager(object, state));
  }
}

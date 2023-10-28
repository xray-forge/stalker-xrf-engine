import { patrol } from "xray16";

import { AbstractScheme } from "@/engine/core/ai/scheme";
import { ISchemePhysicalForceState } from "@/engine/core/schemes/physical/ph_force/ph_force_types";
import { PhysicalForceManager } from "@/engine/core/schemes/physical/ph_force/PhysicalForceManager";
import { abort } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, GameObject, IniFile, Patrol, TIndex, TName, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemePhysicalForce extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_FORCE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.OBJECT;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemePhysicalForceState {
    const state: ISchemePhysicalForceState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.force = readIniNumber(ini, section, "force", true, 0);
    state.time = readIniNumber(ini, section, "time", true, 0);
    state.delay = readIniNumber(ini, section, "delay", false, 0);

    const pathName: TName = readIniString(ini, section, "point", true);
    const index: TIndex = readIniNumber(ini, section, "point_index", false, 0);

    if (state.force === null || state.force <= 0) {
      abort("PH_FORCE : invalid force !");
    }

    if (state.time === null || state.time <= 0) {
      abort("PH_FORCE : invalid time !");
    }

    if (pathName === null || pathName === "") {
      abort("PH_FORCE : invalid waypoint name !");
    }

    const path: Patrol = new patrol(pathName);

    if (index >= path.count()) {
      abort("PH_FORCE : invalid waypoint index.ts !");
    }

    state.point = path.point(index);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemePhysicalForceState
  ): void {
    AbstractScheme.subscribe(object, state, new PhysicalForceManager(object, state));
  }
}

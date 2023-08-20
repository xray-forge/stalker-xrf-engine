import { AbstractScheme } from "@/engine/core/schemes/base";
import { ISchemePostProcessState } from "@/engine/core/schemes/sr_postprocess/ISchemePostProcessState";
import { SchemePostProcessManager } from "@/engine/core/schemes/sr_postprocess/SchemePostProcessManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniNumber } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemePostProcess extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_POSTPROCESS;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * Handle activation of scheme and initialization of new scheme state.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    const state: ISchemePostProcessState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.intensity = readIniNumber(ini, section, "intensity", true) * 0.01;
    state.intensity_speed = readIniNumber(ini, section, "intensity_speed", true) * 0.01;
    state.hit_intensity = readIniNumber(ini, section, "hit_intensity", true);
  }

  /**
   * Add scheme logics into the flow.
   * Creates handling manager and subscribes it to events.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemePostProcessState
  ): void {
    SchemePostProcess.subscribe(object, state, new SchemePostProcessManager(object, state));
  }
}

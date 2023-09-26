import { AbstractScheme } from "@/engine/core/objects/ai/scheme";
import { ISchemePostProcessState } from "@/engine/core/schemes/restrictor/sr_postprocess/ISchemePostProcessState";
import { PostProcessManager } from "@/engine/core/schemes/restrictor/sr_postprocess/PostProcessManager";
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

  public static override activate(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemePostProcessState {
    const state: ISchemePostProcessState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.intensity = readIniNumber(ini, section, "intensity", true) * 0.01;
    state.intensitySpeed = readIniNumber(ini, section, "intensity_speed", true) * 0.01;
    state.hitIntensity = readIniNumber(ini, section, "hit_intensity", true);

    return state;
  }

  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemePostProcessState
  ): void {
    AbstractScheme.subscribe(object, state, new PostProcessManager(object, state));
  }
}

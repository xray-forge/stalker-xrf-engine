import { AbstractScheme } from "@/engine/core/ai/scheme";
import { PostProcessManager } from "@/engine/core/schemes/restrictor/sr_postprocess/PostProcessManager";
import { ISchemePostProcessState } from "@/engine/core/schemes/restrictor/sr_postprocess/sr_postprocess_types";
import { getConfigSwitchConditions, readIniNumber } from "@/engine/core/utils/ini";
import { EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";

/**
 * todo;
 */
export class SchemePostProcess extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_POSTPROCESS;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static override activate(
    object: GameObject,
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
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemePostProcessState
  ): void {
    AbstractScheme.subscribe(state, new PostProcessManager(object, state));
  }
}

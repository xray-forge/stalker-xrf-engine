import { AbstractScheme } from "@/engine/core/ai/scheme/AbstractScheme";
import { registry } from "@/engine/core/database";
import { LightManager } from "@/engine/core/schemes/restrictor/sr_light/LightManager";
import { ISchemeLightState } from "@/engine/core/schemes/restrictor/sr_light/sr_light_types";
import { getConfigSwitchConditions, readIniBoolean } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resetTable } from "@/engine/core/utils/table";
import { EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme implementing logics of managing torches used by stalkers during night hours / in underground levels.
 */
export class SchemeLight extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_LIGHT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeLightState {
    const state: ISchemeLightState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.light = readIniBoolean(ini, section, "light_on", false, false);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeLightState
  ): void {
    AbstractScheme.subscribe(state, new LightManager(object, state));
  }

  public static override reset(): void {
    logger.format("Reset light zones");
    resetTable(registry.lightZones);
  }
}

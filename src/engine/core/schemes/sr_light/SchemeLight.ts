import { registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ISchemeLightState } from "@/engine/core/schemes/sr_light/ISchemeLightState";
import { LightManager } from "@/engine/core/schemes/sr_light/LightManager";
import { getConfigSwitchConditions, readIniBoolean } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resetTable } from "@/engine/core/utils/table";
import { ClientObject, EScheme, ESchemeType, IniFile, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * Class managing torches used by stalkers during night hours / in underground levels.
 */
export class SchemeLight extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_LIGHT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeLightState
  ): void {
    SchemeLight.subscribe(object, state, new LightManager(object, state));
  }

  /**
   * todo: Description.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    const state: ISchemeLightState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.light = readIniBoolean(ini, section, "light_on", false, false);
  }

  /**
   * todo: Description.
   */
  public static override reset(): void {
    logger.info("Reset light zones");
    resetTable(registry.lightZones);
  }
}

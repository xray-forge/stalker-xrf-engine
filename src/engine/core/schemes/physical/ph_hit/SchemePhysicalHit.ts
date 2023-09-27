import { AbstractScheme } from "@/engine/core/objects/ai/scheme";
import { ISchemePhysicalHitState } from "@/engine/core/schemes/physical/ph_hit/ISchemePhysicalHitState";
import { PhysicalHitManager } from "@/engine/core/schemes/physical/ph_hit/PhysicalHitManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemePhysicalHit extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_HIT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.OBJECT;

  public static override activate(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemePhysicalHitState {
    const state: ISchemePhysicalHitState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.power = readIniNumber(ini, section, "power", false, 0);
    state.impulse = readIniNumber(ini, section, "impulse", false, 1000);
    state.bone = readIniString(ini, section, "bone", true);
    state.dir_path = readIniString(ini, section, "dir_path", true);

    return state;
  }

  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemePhysicalHitState
  ): void {
    SchemePhysicalHit.subscribe(object, state, new PhysicalHitManager(object, state));
  }
}

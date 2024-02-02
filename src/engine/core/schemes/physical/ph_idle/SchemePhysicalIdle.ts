import { AbstractScheme } from "@/engine/core/ai/scheme";
import { ISchemePhysicalIdleState } from "@/engine/core/schemes/physical/ph_idle/ph_idle_types";
import { PhysicalIdleManager } from "@/engine/core/schemes/physical/ph_idle/PhysicalIdleManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { parseBoneStateDescriptors } from "@/engine/core/utils/ini/ini_parse";
import { readIniBoolean, readIniConditionList, readIniString } from "@/engine/core/utils/ini/ini_read";
import { EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";

/**
 * Scheme to manage idle state of items.
 * Allows adding handling of `hit` and `use` callbacks for static objects.
 */
export class SchemePhysicalIdle extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_IDLE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.OBJECT;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemePhysicalIdleState {
    const state: ISchemePhysicalIdleState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.bonesHitCondlists = parseBoneStateDescriptors(readIniString(ini, section, "hit_on_bone", false));
    state.isNonscriptUsable = readIniBoolean(ini, section, "nonscript_usable", false);
    state.onUse = readIniConditionList(ini, section, "on_use");
    state.tip = readIniString(ini, section, "tips", false, null, "");

    object.set_tip_text(state.tip);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemePhysicalIdleState
  ): void {
    AbstractScheme.subscribe(state, new PhysicalIdleManager(object, state));
  }
}

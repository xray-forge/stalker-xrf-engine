import { AbstractScheme } from "@/engine/core/ai/scheme";
import { NoWeaponManager } from "@/engine/core/schemes/restrictor/sr_no_weapon/NoWeaponManager";
import { ISchemeNoWeaponState } from "@/engine/core/schemes/restrictor/sr_no_weapon/sr_no_weapon_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme to define logics when actor is in no-weapon zone or not to allow usage of weapons.
 */
export class SchemeNoWeapon extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_NO_WEAPON;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeNoWeaponState {
    const state: ISchemeNoWeaponState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeNoWeaponState
  ): void {
    AbstractScheme.subscribe(state, new NoWeaponManager(object, state));
  }
}

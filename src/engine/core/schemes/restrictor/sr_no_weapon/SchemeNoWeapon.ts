import { GameObject, IniFile } from "xray16/alias";
import { TSection } from "xray16/lib";

import { getConfigSwitchConditions } from "@/engine/core/ini";
import { AbstractScheme } from "@/engine/core/schemes/base";
import { NoWeaponManager } from "@/engine/core/schemes/restrictor/sr_no_weapon/NoWeaponManager";
import { ISchemeNoWeaponState } from "@/engine/core/schemes/restrictor/sr_no_weapon/sr_no_weapon_types";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";

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

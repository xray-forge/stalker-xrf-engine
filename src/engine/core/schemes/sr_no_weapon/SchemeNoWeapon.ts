import { AbstractScheme } from "@/engine/core/schemes/base";
import { ISchemeNoWeaponState } from "@/engine/core/schemes/sr_no_weapon/ISchemeNoWeaponState";
import { NoWeaponManager } from "@/engine/core/schemes/sr_no_weapon/NoWeaponManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, TNumberId, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Observe whether actor is in no-weapon zone or not and allow usage of weapons.
 */
export class SchemeNoWeapon extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_NO_WEAPON;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  // todo: Move to registry.
  public static NO_WEAPON_ZONES_STATE: LuaTable<TNumberId, boolean> = new LuaTable();

  /**
   * Activate scheme logics and create matching states.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    const state: ISchemeNoWeaponState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
  }

  /**
   * Add handlers related to scheme and subscribe to events.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeNoWeaponState
  ): void {
    SchemeNoWeapon.subscribe(object, state, new NoWeaponManager(object, state, this));
  }

  /**
   * todo: Description.
   * todo: Move to separate util to check.
   */
  public static isInWeaponRestrictionZone(): boolean {
    for (const [id, isActive] of SchemeNoWeapon.NO_WEAPON_ZONES_STATE) {
      if (isActive) {
        return true;
      }
    }

    return false;
  }
}

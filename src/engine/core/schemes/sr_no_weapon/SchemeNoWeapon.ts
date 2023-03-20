import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base";
import { ISchemeNoWeaponState } from "@/engine/core/schemes/sr_no_weapon/ISchemeNoWeaponState";
import { NoWeaponManager } from "@/engine/core/schemes/sr_no_weapon/NoWeaponManager";
import { subscribeActionForEvents } from "@/engine/core/schemes/subscribeActionForEvents";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TNumberId, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Observe whether actor is in no-weapon zone or not and allow usage of weapons.
 */
export class SchemeNoWeapon extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_NO_WEAPON;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static NO_WEAPON_ZONES_STATE: LuaTable<TNumberId, boolean> = new LuaTable();

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeNoWeaponState
  ): void {
    subscribeActionForEvents(object, state, new NoWeaponManager(object, state, this));
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeNoWeaponState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
  }

  /**
   * todo;
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

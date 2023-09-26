import { AbstractScheme } from "@/engine/core/objects/ai/scheme";
import { ISchemeNoWeaponState } from "@/engine/core/schemes/restrictor/sr_no_weapon/ISchemeNoWeaponState";
import { NoWeaponManager } from "@/engine/core/schemes/restrictor/sr_no_weapon/NoWeaponManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Observe whether actor is in no-weapon zone or not and allow usage of weapons.
 */
export class SchemeNoWeapon extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_NO_WEAPON;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * Activate scheme logics and create matching states.
   */
  public static override activate(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeNoWeaponState {
    const state: ISchemeNoWeaponState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);

    return state;
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
    AbstractScheme.subscribe(object, state, new NoWeaponManager(object, state));
  }
}

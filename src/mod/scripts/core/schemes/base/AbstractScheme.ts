import { XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { IRegistryObjectState } from "@/mod/scripts/core/database";
import { IBaseSchemeState } from "@/mod/scripts/core/schemes/base/IBaseSchemeState";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("AbstractScheme");

/**
 * todo;
 */
export type TAbstractSchemeConstructor = typeof AbstractScheme;

/**
 * todo;
 */
export abstract class AbstractScheme {
  public static readonly SCHEME_SECTION: EScheme;
  public static readonly SCHEME_TYPE: ESchemeType;

  /**
   * todo;
   */
  public static setScheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    additional: Optional<string>
  ): void {
    abort("Called not implemented setScheme method: %s, %s", object.name(), scheme);
  }

  /**
   * Add scheme to object binder for initialization.
   */
  public static addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    schemeState: IBaseSchemeState
  ): void {
    abort("Called not implemented addToBinder method: %s, %s", object.name(), scheme);
  }

  /**
   * todo;
   */
  public static resetScheme(
    object: XR_game_object,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    abort("Called not implemented resetScheme method: %s, %s", object.name(), scheme);
  }

  /**
   * todo;
   */
  public static disableScheme(object: XR_game_object, scheme: EScheme): void {
    abort("Called not implemented disableScheme method: %s, %s", object.name(), scheme);
  }
}

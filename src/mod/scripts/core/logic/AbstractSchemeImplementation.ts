import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/configuration";
import { IStoredObject } from "@/mod/scripts/core/db";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("AbstractSchemeAction");

export type TAbstractSchemeConstructor = typeof AbstractSchemeImplementation;

export abstract class AbstractSchemeImplementation {
  public static readonly SCHEME_SECTION: EScheme;
  public static readonly SCHEME_TYPE: ESchemeType;

  /**
   * Add scheme to object binder for initialization.
   */
  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    abort("Called not implemented add_to_binder method: %s, %s", object.name(), scheme);
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    additional: string
  ): void {
    abort("Called not implemented set_scheme method: %s, %s", object.name(), scheme);
  }

  public static resetScheme(object: XR_game_object, scheme: EScheme, state: IStoredObject, section: TSection): void {
    abort("Called not implemented resetScheme method: %s, %s", object.name(), scheme);
  }

  public static disable_scheme(object: XR_game_object, scheme: EScheme): void {
    abort("Called not implemented disable_scheme method: %s, %s", object.name(), scheme);
  }

  public readonly object: XR_game_object;
  public readonly state: IStoredObject;

  public constructor(object: XR_game_object, state: IStoredObject) {
    this.object = object;
    this.state = state;
  }

  public update(delta: number): void {}

  public reset_scheme(): void {
    logger.info("Reset scheme:", this.constructor.prototype.SCHEME_SECTION, this.object.name());
  }

  public deactivate(): void {
    logger.info("Deactivate:", this.constructor.prototype.SCHEME_SECTION, this.object.name());
  }

  public net_spawn(): void {
    logger.info("Net spawn:", this.constructor.prototype.SCHEME_SECTION, this.object.name());
  }

  public net_destroy(): void {
    logger.info("Net destroy:", this.constructor.prototype.SCHEME_SECTION, this.object.name());
  }
}

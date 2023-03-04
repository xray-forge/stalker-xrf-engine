import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { IStoredObject } from "@/mod/scripts/core/database";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("AbstractSchemeImplementation");

export type TAbstractSchemeConstructor = typeof AbstractScheme;

/**
 * todo;
 */
export abstract class AbstractScheme {
  public static readonly SCHEME_SECTION: EScheme;
  public static readonly SCHEME_TYPE: ESchemeType;

  /**
   * Add scheme to object binder for initialization.
   */
  public static addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    schemeState: IStoredObject
  ): void {
    abort("Called not implemented addToBinder method: %s, %s", object.name(), scheme);
  }

  /**
   * todo;
   */
  public static setScheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    additional: string
  ): void {
    abort("Called not implemented setScheme method: %s, %s", object.name(), scheme);
  }

  /**
   * todo;
   */
  public static resetScheme(object: XR_game_object, scheme: EScheme, state: IStoredObject, section: TSection): void {
    abort("Called not implemented resetScheme method: %s, %s", object.name(), scheme);
  }

  /**
   * todo;
   */
  public static disableScheme(object: XR_game_object, scheme: EScheme): void {
    abort("Called not implemented disableScheme method: %s, %s", object.name(), scheme);
  }

  public readonly object: XR_game_object;
  public readonly state: IStoredObject;

  public constructor(object: XR_game_object, state: IStoredObject) {
    this.object = object;
    this.state = state;
  }

  /**
   * todo;
   */
  public update(delta: number): void {}

  /**
   * todo;
   */
  public resetScheme(): void {
    logger.info("Reset scheme:", this.constructor.prototype.SCHEME_SECTION, this.object.name());
  }

  /**
   * todo;
   */
  public deactivate(): void {
    logger.info("Deactivate:", this.constructor.prototype.SCHEME_SECTION, this.object.name());
  }

  /**
   * todo;
   */
  public net_spawn(): void {
    logger.info("Net spawn:", this.constructor.prototype.SCHEME_SECTION, this.object.name());
  }

  /**
   * todo;
   */
  public net_destroy(): void {
    logger.info("Net destroy:", this.constructor.prototype.SCHEME_SECTION, this.object.name());
  }
}

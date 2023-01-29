import { XR_game_object, XR_ini_file } from "xray16";

import { TScheme, TSection } from "@/mod/lib/types/configuration";
import { IStoredObject } from "@/mod/scripts/core/db";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("AbstractSchemeAction");

export abstract class AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string;

  /**
   * Add scheme to object binder for initialization.
   */
  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    abort("Called not implemented add_to_binder method: %s, %s", object.name(), scheme);
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    additional: string
  ): void {
    abort("Called not implemented set_scheme method: %s, %s", object.name(), scheme);
  }

  public static disable_scheme(object: XR_game_object, scheme: string): void {
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
    log.info("Reset scheme:", this.object.name());
  }

  public deactivate(): void {
    log.info("Deactivate:", this.object.name());
  }

  public net_spawn(): void {
    log.info("Net spawn:", this.object.name());
  }

  public net_destroy(): void {
    log.info("Net destroy:", this.object.name());
  }
}

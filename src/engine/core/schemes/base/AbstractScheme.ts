import { XR_game_object, XR_ini_file } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { IBaseSchemeState } from "@/engine/core/schemes/base/IBaseSchemeState";
import { abort } from "@/engine/core/utils/debug";
import { LuaLogger } from "@/engine/core/utils/logging";
import { STRINGIFIED_NIL } from "@/engine/lib/constants/words";
import { Optional } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

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
   * todo: Description.
   */
  protected static assignStateAndBind<T extends IBaseSchemeState>(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: Optional<TSection>
  ): T {
    logger.info("Assign scheme:", scheme, "->", object.name(), "->", section || STRINGIFIED_NIL);

    const objectState: IRegistryObjectState = registry.objects.get(object.id());
    let schemeState: Optional<T> = objectState[scheme] as Optional<T>;

    if (schemeState === null) {
      schemeState = {
        npc: object,
      } as T;

      objectState[scheme] = schemeState;

      registry.schemes.get(scheme).addToBinder(object, ini, scheme, section as TSection, schemeState);
    }

    schemeState.scheme = scheme;
    schemeState.section = section;
    schemeState.ini = ini;

    return schemeState;
  }

  /**
   * todo: Description.
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
   * todo: Description.
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
   * todo: Description.
   */
  public static disableScheme(object: XR_game_object, scheme: EScheme): void {
    abort("Called not implemented disableScheme method: %s, %s", object.name(), scheme);
  }
}

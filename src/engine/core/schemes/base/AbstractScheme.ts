import { XR_game_object, XR_ini_file } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { IBaseSchemeState } from "@/engine/core/schemes/base/IBaseSchemeState";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NIL } from "@/engine/lib/constants/words";
import { AnyObject, Optional, TName } from "@/engine/lib/types";
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
  public static disable(object: XR_game_object, scheme: EScheme): void {
    abort("Called not implemented 'disable' method: %s, %s.", object.name(), scheme);
  }

  /**
   * todo: Description.
   */
  public static activate(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    additional: Optional<string>
  ): void {
    abort("Called not implemented 'activate' method: %s, %s", object.name(), scheme);
  }

  /**
   * todo: Description.
   */
  protected static assign<T extends IBaseSchemeState>(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: Optional<TSection>
  ): T {
    const objectState: IRegistryObjectState = registry.objects.get(object.id());
    let schemeState: Optional<T> = objectState[scheme] as Optional<T>;

    if (schemeState === null) {
      schemeState = {
        npc: object,
      } as T;

      objectState[scheme] = schemeState;

      registry.schemes.get(scheme).add(object, ini, scheme, section as TSection, schemeState);
    }

    schemeState.scheme = scheme;
    schemeState.section = section;
    schemeState.ini = ini;

    return schemeState;
  }

  /**
   * Add scheme state to client object.
   */
  public static add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    schemeState: IBaseSchemeState
  ): void {
    abort("Called not implemented 'add' method: %s, %s, %s.", object.name(), scheme, section);
  }

  /**
   * todo: Description.
   */
  public static reset(object: XR_game_object, scheme: EScheme, state: IRegistryObjectState, section: TSection): void {
    abort("Called not implemented 'reset' method: %s, %s, %s.", object.name(), scheme, section);
  }

  /**
   * todo: Description.
   */
  public static subscribe(
    object: XR_game_object,
    state: IBaseSchemeState,
    newAction: TName | AnyObject | LuaTable
  ): void {
    if (!state.actions) {
      state.actions = new LuaTable();
    }

    state.actions.set(newAction as any, true);
  }

  /**
   * todo: Description.
   */
  public static unsubscribe(object: XR_game_object, state: IBaseSchemeState, action: AnyObject): void {
    if (state.actions) {
      state.actions.delete(action);
    } else {
      state.actions = new LuaTable();
    }
  }
}

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { IBaseSchemeState } from "@/engine/core/schemes/base/IBaseSchemeState";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { AnyObject, ClientObject, IniFile, Optional, TName } from "@/engine/lib/types";
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
  public static disable(object: ClientObject, scheme: EScheme): void {
    abort("Called not implemented 'disable' method: %s, %s.", object.name(), scheme);
  }

  /**
   * todo: Description.
   * Activate scheme by parameters.
   *
   * @param object - client object to handle with provided scheme
   * @param ini - ini file with scheme details
   * @param scheme - name of scheme to activate, `mob_home` as example
   * @param section - scheme section, `mob_home@2` as example
   * @param additional - additional scheme data
   */
  public static activate(
    object: ClientObject,
    ini: IniFile,
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
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: Optional<TSection>
  ): T {
    const objectState: IRegistryObjectState = registry.objects.get(object.id());
    let schemeState: Optional<T> = objectState[scheme] as Optional<T>;

    if (!schemeState) {
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
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    schemeState: IBaseSchemeState
  ): void {
    abort("Called not implemented 'add' method: %s, %s, %s.", object.name(), scheme, section);
  }

  /**
   * todo: Description.
   */
  public static reset(object: ClientObject, scheme: EScheme, state: IRegistryObjectState, section: TSection): void {
    abort("Called not implemented 'reset' method: %s, %s, %s.", object.name(), scheme, section);
  }

  /**
   * todo: Description.
   */
  public static subscribe(
    object: ClientObject,
    state: IBaseSchemeState,
    subscriber: TName | AnyObject | LuaTable
  ): void {
    if (!state.actions) {
      state.actions = new LuaTable();
    }

    state.actions.set(subscriber as unknown as AnyObject, true);
  }

  /**
   * todo: Description.
   */
  public static unsubscribe(object: ClientObject, state: IBaseSchemeState, action: AnyObject): void {
    if (state.actions) {
      state.actions.delete(action);
    } else {
      state.actions = new LuaTable();
    }
  }
}

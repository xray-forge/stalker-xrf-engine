import { IBaseSchemeState, IRegistryObjectState, registry } from "@/engine/core/database";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { AnyObject, ClientObject, IniFile, ISchemeEventHandler, Optional, TName } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Typing describing abstract scheme implementation.
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
   * @param smartTerrainName - additional scheme data with smart terrain name
   */
  public static activate(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    smartTerrainName?: Optional<TName>
  ): void {
    abort("Called not implemented 'activate' method: %s, %s", object.name(), scheme);
  }

  /**
   * Assign some scheme state to an object and prepare shared constants in it in a correct way.
   * Initializes base state in object registry.
   *
   * todo;
   *
   * @returns base scheme state for provided `scheme`
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
      schemeState = {} as T;
      objectState[scheme] = schemeState;

      registry.schemes.get(scheme).add(object, ini, scheme, section as TSection, schemeState);
    }

    schemeState.scheme = scheme;
    schemeState.section = section;
    schemeState.ini = ini;

    return schemeState;
  }

  /**
   * Add scheme state handlers to client object states.
   * Called once if object registry state does not have created base state for provided scheme.
   *
   * @param object - target client object
   * @param ini - ini file describing object logic
   * @param scheme - new scheme type
   * @param section - new logic section
   * @param schemeState - state of new scheme
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
   * Reset schemes on activation of new section.
   * Scheme may be different or same, but expected section is different.
   * Mainly used for shared generic schemes that are always active.
   *
   * @param object - target client object
   * @param scheme - new scheme type
   * @param state - target object registry state
   * @param section - new active section
   */
  public static reset(object: ClientObject, scheme: EScheme, state: IRegistryObjectState, section: TSection): void {
    abort("Called not implemented 'reset' method: %s, %s, %s.", object.name(), scheme, section);
  }

  /**
   * todo: Description.
   */
  public static subscribe(object: ClientObject, state: IBaseSchemeState, subscriber: ISchemeEventHandler): void {
    if (!state.actions) {
      state.actions = new LuaTable();
    }

    state.actions.set(subscriber as unknown as AnyObject, true);
  }

  /**
   * Ub-subscribe provided action class from scheme events.
   *
   * @param object - target client object owning scheme states
   * @param state - scheme state owning action subscriber
   * @param action - action subscribing handler
   */
  public static unsubscribe(object: ClientObject, state: IBaseSchemeState, action: AnyObject): void {
    if (state.actions) {
      state.actions.delete(action);
    } else {
      state.actions = new LuaTable();
    }
  }
}

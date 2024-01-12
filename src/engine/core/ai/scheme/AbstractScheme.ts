import { IBaseSchemeState, IRegistryObjectState, registry } from "@/engine/core/database";
import { abort } from "@/engine/core/utils/assertion";
import { AnyObject, GameObject, IniFile, ISchemeEventHandler, Optional, TName } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

/**
 * Type describing abstract scheme implementation static class.
 */
export type TAbstractSchemeConstructor = typeof AbstractScheme;

/**
 * Abstract scheme implementation.
 * Used to define logics of stalkers when specific scenarios from ltx scripts are processed and new section appears.
 * Defines how scheme should be activated, initialized, reset and deactivated.
 */
export abstract class AbstractScheme {
  public static readonly SCHEME_SECTION: EScheme;
  public static readonly SCHEME_TYPE: ESchemeType;

  /**
   * Implementation of scheme activation.
   * Handling of logics section switching to current scheme from ltx script file.
   *
   * @param object - game object to handle with provided scheme
   * @param ini - ini file with scheme details
   * @param scheme - name of scheme to activate, `mob_home` as example
   * @param section - scheme section, `mob_home@2` as example
   * @param smartTerrainName - additional scheme data with smart terrain name
   */
  public static activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    smartTerrainName?: Optional<TName>
  ): IBaseSchemeState {
    abort("Called not implemented 'activate' method: '%s', '%s', '%s'.", object.name(), scheme, section);
  }

  /**
   * Assign scheme data for working with logics.
   * Initializes base state in object registry where key is current scheme.
   *
   * @param object - game object
   * @param ini - file to read scheme configuration from
   * @param scheme - type of scheme activated
   * @param section - section of activated logics
   * @returns base scheme state for provided `scheme`
   */
  protected static assign<T extends IBaseSchemeState>(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: Optional<TSection>
  ): T {
    const objectState: IRegistryObjectState = registry.objects.get(object.id());
    let state: Optional<T> = objectState[scheme] as Optional<T>;

    if (!state) {
      state = {} as T;
      objectState[scheme] = state;

      registry.schemes.get(scheme).add(object, ini, scheme, section as TSection, state);
    }

    state.ini = ini;
    state.scheme = scheme;
    state.section = section;

    return state;
  }

  /**
   * Initialize current state and add scheme state handlers for game object state.
   *
   * @param object - game object
   * @param ini - ini file describing object logic
   * @param scheme - new scheme type
   * @param section - new logic section
   * @param state - state of new scheme to initialize data into
   */
  public static add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: IBaseSchemeState
  ): void {
    abort("Called not implemented 'add' method: '%s', '%s', '%s'.", object.name(), scheme, section);
  }

  /**
   * Reset schemes on activation of new section.
   * Scheme may be different or same, but expected section is different.
   * Mainly used for shared generic schemes that are always active.
   *
   * @param object - game object
   * @param scheme - new scheme type
   * @param state - target object registry state
   * @param section - new active section
   */
  public static reset(object: GameObject, scheme: EScheme, state: IRegistryObjectState, section: TSection): void {
    abort("Called not implemented 'reset' method: '%s', '%s', '%s'.", object.name(), scheme, section);
  }

  /**
   * Generic method to disable scheme logics.
   * Used with persistent schemes that are always active independently of current logics section.
   *
   * @param object - game object
   * @param scheme - target scheme to disable for
   */
  public static disable(object: GameObject, scheme: EScheme): void {
    abort("Called not implemented 'disable' method: '%s', '%s'.", object.name(), scheme);
  }

  /**
   * Subscribe provided scheme state to scheme actions.
   * Once scheme events occur subscriber will be used to handle them.
   *
   * @param state - scheme state owning action subscriber
   * @param subscriber - action subscribing handler
   */
  public static subscribe(state: IBaseSchemeState, subscriber: ISchemeEventHandler): void {
    if (!state.actions) {
      state.actions = new LuaTable();
    }

    state.actions.set(subscriber as unknown as AnyObject, true);
  }

  /**
   * Ub-subscribe provided action class from scheme events.
   *
   * @param state - scheme state owning action subscriber
   * @param subscriber - action subscribing handler
   */
  public static unsubscribe(state: IBaseSchemeState, subscriber: ISchemeEventHandler): void {
    if (state.actions) {
      state.actions.delete(subscriber);
    }
  }

  /**
   * Not intended to be created as instance.
   * Marked as protected.
   */
  protected constructor() {}
}

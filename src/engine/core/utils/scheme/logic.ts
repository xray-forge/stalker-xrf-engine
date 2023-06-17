import { IStoredOfflineObject, registry } from "@/engine/core/database";
import { ESchemeEvent, IBaseSchemeLogic, IBaseSchemeState } from "@/engine/core/schemes";
import { assert, assertDefined } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { readIniConditionList } from "@/engine/core/utils/ini/read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NIL } from "@/engine/lib/constants/words";
import { AnyArgs, AnyContextualCallable, ClientObject, IniFile, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Check if provided scheme state is active.
 * todo: Get only section, not whole state.
 */
export function isSectionActive(object: ClientObject, state: IBaseSchemeState): boolean {
  assertDefined(state.section, "Object %s '%s': state.section is null.", object.name(), state.section);

  return state.section === registry.objects.get(object.id()).active_section;
}

/**
 * Emit scheme event for active `actions` list in scheme state.
 *
 * @param object - client object working on scheme
 * @param state - scheme state for emitting
 * @param event - event type to emit
 * @param rest - event args
 */
export function emitSchemeEvent(
  object: ClientObject,
  state: IBaseSchemeState,
  event: ESchemeEvent,
  ...rest: AnyArgs
): void {
  if (!state || !state.actions) {
    return;
  }

  // todo: Probably it is Set and `isHandlerActive` check is not needed.
  for (const [actionHandler, isHandlerActive] of state.actions) {
    if (isHandlerActive && actionHandler[event] !== null) {
      (actionHandler[event] as AnyContextualCallable).apply(actionHandler, rest);
    }
  }
}

/**
 * Determine which section to activate for an object.
 * In case of offline->online switch try to restore previous job.
 * In other cases try to get active scheme from ini config settings.
 *
 * @param object - client object to get object section
 * @param ini - ini file of the object
 * @param section - desired logics section
 * @returns section to activate
 */
export function getSectionToActivate(object: ClientObject, ini: IniFile, section: TSection): TSection {
  if (!ini.section_exist(section)) {
    return NIL;
  }

  const offlineObjectDescriptor: Optional<IStoredOfflineObject> = registry.offlineObjects.get(object.id());

  /**
   * If offline object detected, try to continue previous jon on online switch.
   */
  if (offlineObjectDescriptor?.activeSection) {
    const sectionToRetry: TSection = offlineObjectDescriptor.activeSection;

    offlineObjectDescriptor.activeSection = null;

    if (ini.section_exist(sectionToRetry)) {
      return sectionToRetry;
    }
  }

  const activeSectionCond: Optional<IBaseSchemeLogic> = readIniConditionList(ini, section, "active");

  if (activeSectionCond) {
    const section: Optional<TSection> = pickSectionFromCondList(registry.actor, object, activeSectionCond.condlist);

    // todo: Log also ini file path for simplicity of debug?
    assert(section, "'%s' => '%s', 'active' field has no conditionless else clause.", object.name(), section);

    return section;
  } else {
    return NIL;
  }
}

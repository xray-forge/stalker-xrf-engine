import { IStoredOfflineObject, registry } from "@/engine/core/database";
import { IBaseSchemeLogic } from "@/engine/core/schemes/base";
import { abort } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { readIniConditionList } from "@/engine/core/utils/ini/getters";
import { NIL } from "@/engine/lib/constants/words";
import { ClientObject, IniFile, Optional } from "@/engine/lib/types";
import { TSection } from "@/engine/lib/types/scheme";

/**
 * Determine which section to activate for an object.
 * In case of offline->online switch try to restore previous job.
 * In other cases try to get active scheme from ini config.
 *
 * // todo: params
 * @returns section to activate
 */
export function getObjectSectionToActivate(
  object: ClientObject,
  ini: IniFile,
  sectionLogic: TSection,
  actor: ClientObject
): TSection {
  if (!ini.section_exist(sectionLogic)) {
    return NIL;
  }

  const offlineObjectDescriptor: Optional<IStoredOfflineObject> = registry.offlineObjects.get(object.id());

  /**
   * If offline object detected, try to continue previous jon on online switch.
   */
  if (offlineObjectDescriptor !== null && offlineObjectDescriptor.activeSection !== null) {
    const sectionToRetry: TSection = offlineObjectDescriptor.activeSection;

    offlineObjectDescriptor.activeSection = null;

    if (ini.section_exist(sectionToRetry)) {
      return sectionToRetry;
    }
  }

  const activeSectionCond: Optional<IBaseSchemeLogic> = readIniConditionList(ini, sectionLogic, "active");

  if (activeSectionCond === null) {
    return NIL;
  } else {
    const section: Optional<TSection> = pickSectionFromCondList(actor, object, activeSectionCond.condlist);

    if (!section) {
      abort(
        "object '%s': section '%s': section 'active' has no conditionless else clause",
        object.name(),
        sectionLogic
      );
    }

    return section;
  }
}

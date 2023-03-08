import { XR_game_object, XR_ini_file } from "xray16";

import { STRINGIFIED_NIL } from "@/mod/globals/lua";
import { TSection } from "@/mod/lib/types/scheme";
import { registry } from "@/mod/scripts/core/database";
import { getConfigConditionList, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";

/**
 * todo;
 * todo;
 * todo;
 * todo;
 */
export function determine_section_to_activate(
  npc: XR_game_object,
  ini: XR_ini_file,
  sectionLogic: TSection,
  actor: XR_game_object
): TSection {
  if (!ini.section_exist(sectionLogic)) {
    return STRINGIFIED_NIL;
  }

  if (registry.offlineObjects.get(npc.id())?.active_section !== null) {
    const sectionToRetr = registry.offlineObjects.get(npc.id()).active_section as TSection;

    registry.offlineObjects.get(npc.id()).active_section = null;
    if (ini.section_exist(sectionToRetr)) {
      return sectionToRetr;
    }
  }

  const activeSectionCond = getConfigConditionList(ini, sectionLogic, "active", npc);

  if (activeSectionCond) {
    const section = pickSectionFromCondList(actor, npc, activeSectionCond.condlist);

    if (!section) {
      abort("object '%s': section '%s': section 'active' has no conditionless }else{ clause", npc.name(), sectionLogic);
    }

    return section;
  } else {
    return STRINGIFIED_NIL;
  }
}

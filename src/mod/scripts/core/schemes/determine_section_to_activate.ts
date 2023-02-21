import { XR_game_object, XR_ini_file } from "xray16";

import { STRINGIFIED_NIL } from "@/mod/globals/lua";
import { TSection } from "@/mod/lib/types/scheme";
import { registry } from "@/mod/scripts/core/database";
import { getConfigCondList, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
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
  section_logic: TSection,
  actor: XR_game_object
): TSection {
  if (!ini.section_exist(section_logic)) {
    return STRINGIFIED_NIL;
  }

  if (registry.offlineObjects.get(npc.id())?.active_section !== null) {
    const sect_to_retr = registry.offlineObjects.get(npc.id()).active_section as TSection;

    registry.offlineObjects.get(npc.id()).active_section = null;
    if (ini.section_exist(sect_to_retr)) {
      return sect_to_retr;
    }
  }

  const active_section_cond = getConfigCondList(ini, section_logic, "active", npc);

  if (active_section_cond) {
    const section = pickSectionFromCondList(actor, npc, active_section_cond.condlist);

    if (!section) {
      abort(
        "object '%s': section '%s': section 'active' has no conditionless }else{ clause",
        npc.name(),
        section_logic
      );
    }

    return section;
  } else {
    return STRINGIFIED_NIL;
  }
}

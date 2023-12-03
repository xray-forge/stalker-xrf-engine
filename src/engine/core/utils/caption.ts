import { game } from "xray16";

import { SYSTEM_INI } from "@/engine/core/database";
import { Optional, TLabel, TSection } from "@/engine/lib/types";

/**
 * Get matching translation for section if it exists.
 *
 * @param section - section name to check for translated name
 * @returns translated item name if translation is declared
 */
export function getInventoryNameForItemSectionSafely(section: TSection): TLabel {
  if (SYSTEM_INI.section_exist(section) && SYSTEM_INI.line_exist(section, "inv_name")) {
    const caption: Optional<TLabel> = SYSTEM_INI.r_string(section, "inv_name");

    return game.translate_string(caption || section);
  } else {
    return game.translate_string(section);
  }
}

/**
 * Get matching translation for section.
 *
 * @param section - section name to check for translated name
 * @returns translated item inventory name
 */
export function getInventoryNameForItemSection(section: TSection): TLabel {
  return game.translate_string(SYSTEM_INI.r_string(section, "inv_name"));
}

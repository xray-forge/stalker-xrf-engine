import { $isNil } from "xray16/macros";

import { registry, SYSTEM_INI } from "@/engine/core/database";
import { readIniString } from "@/engine/core/utils/ini";
import { GameObject, IniFile, Nillable, TCount, TName, TSection } from "@/engine/lib/types";

/**
 * Setup object visuals based on global section description.
 * Used to copy current actor visual in cutscenes and display same armor/helmet as currently equipped by player.
 *
 * @param object - Game object to initialize visuals for.
 */
export function setupObjectStalkerVisual(object: GameObject): void {
  const visual: Nillable<TName> = readIniString(SYSTEM_INI, object.section(), "set_visual", false);

  if (visual && visual !== "") {
    object.set_visual_name(visual === "actor_visual" ? registry.actor.get_visual_name() : visual);
  }
}

/**
 * Setup object info portions for game object.
 *
 * @param object - Game to object to initialize info portions for.
 * @param ini - Ini file to read info from.
 * @param section - Ini file section to read info from.
 */
export function setupObjectInfoPortions(object: GameObject, ini: IniFile, section: Nillable<TSection> = null): void {
  section = $isNil(section) ? "known_info" : section;

  if (ini.section_exist(section)) {
    const knownInfosCount: TCount = ini.line_count(section);

    for (const it of $range(0, knownInfosCount - 1)) {
      const [, infoPortion] = ini.r_line(section, it, "", "");

      object.give_info_portion(infoPortion);
    }
  }
}

import { registry, SYSTEM_INI } from "@/engine/core/database";
import { readIniString } from "@/engine/core/utils/ini";
import { GameObject, IniFile, Optional, TCount, TName, TSection } from "@/engine/lib/types";

/**
 * Setup object visuals based on global section description.
 * Used to copy current actor visual in cutscenes and display same armor/helmet as currently equipped by player.
 *
 * @param object - game object to initialize visuals for
 */
export function setupObjectStalkerVisual(object: GameObject): void {
  const visual: Optional<TName> = readIniString(SYSTEM_INI, object.section(), "set_visual", false);

  if (visual && visual !== "") {
    object.set_visual_name(visual === "actor_visual" ? registry.actor.get_visual_name() : visual);
  }
}

/**
 * Setup object info portions for game object.
 *
 * @param object - game to object to initialize info portions for
 * @param ini - ini file to read info from
 * @param section - ini file section to read info from
 */
export function setupObjectInfoPortions(object: GameObject, ini: IniFile, section: Optional<TSection> = null): void {
  section = section === null ? "known_info" : section;

  if (ini.section_exist(section)) {
    const knownInfosCount: TCount = ini.line_count(section);

    for (const it of $range(0, knownInfosCount - 1)) {
      const [, infoPortion] = ini.r_line(section, it, "", "");

      object.give_info_portion(infoPortion);
    }
  }
}

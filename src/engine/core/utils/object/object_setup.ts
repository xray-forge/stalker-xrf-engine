import { ini_file } from "xray16";

import { DUMMY_LTX, registry, SYSTEM_INI } from "@/engine/core/database";
import { readIniString } from "@/engine/core/utils/ini";
import { ClientObject, IniFile, Optional, TCount, TName, TSection } from "@/engine/lib/types";

/**
 * Setup object visuals based on global section description.
 *
 * @param object - target game object to initialize visuals for
 */
export function getObjectStalkerIni(object: ClientObject): IniFile {
  const spawnIni: Optional<IniFile> = object.spawn_ini();
  const stalkerIniFilename: Optional<TName> = spawnIni === null ? null : readIniString(spawnIni, "logic", "cfg", false);

  return stalkerIniFilename ? new ini_file(stalkerIniFilename) : spawnIni ?? DUMMY_LTX;
}

/**
 * Setup object visuals based on global section description.
 *
 * @param object - target game object to initialize visuals for
 */
export function setupObjectStalkerVisual(object: ClientObject): void {
  const visual: TName = readIniString(SYSTEM_INI, object.section(), "set_visual", false);

  if (visual !== null && visual !== "") {
    object.set_visual_name(visual === "actor_visual" ? registry.actor.get_visual_name() : visual);
  }
}

/**
 * Setup object info portions for game object.
 *
 * @param object - target game to object to initialize info portions for
 * @param ini - ini file to read info from
 * @param section - ini file section to read info from
 */
export function setupObjectInfoPortions(object: ClientObject, ini: IniFile, section: Optional<TSection> = null): void {
  section = section === null ? "known_info" : section;

  if (ini.section_exist(section)) {
    const knownInfosCount: TCount = ini.line_count(section);

    for (const it of $range(0, knownInfosCount - 1)) {
      const [, infoPortion] = ini.r_line(section, it, "", "");

      object.give_info_portion(infoPortion);
    }
  }
}

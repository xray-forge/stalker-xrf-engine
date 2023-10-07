import {
  AbstractPlayableSound,
  ActorSound,
  LoopedSound,
  NpcSound,
  ObjectSound,
} from "@/engine/core/managers/sounds/objects";
import type { EPlayableSound } from "@/engine/core/managers/sounds/sounds_types";
import { abort, assert } from "@/engine/core/utils/assertion";
import { readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { IniFile, TCount, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 *
 * @param ini - target ini file to read list from
 * @returns list of sound themes from ini file
 */
export function readIniThemesList(ini: IniFile): LuaTable<TName, AbstractPlayableSound> {
  assert(ini.section_exist("list"), "There is no section [list] in themes list ini file.");

  const themes: LuaTable<TName, AbstractPlayableSound> = new LuaTable();
  const themesCount: TCount = ini.line_count("list");

  logger.info("Load sound themes:", themesCount);

  for (const it of $range(0, themesCount - 1)) {
    const [, field] = ini.r_line("list", it, "", "");

    const type: EPlayableSound = readIniString<EPlayableSound>(ini, field, "type", true) as EPlayableSound;

    switch (type) {
      case ObjectSound.type:
        themes.set(field, new ObjectSound(ini, field));
        break;

      case NpcSound.type:
        themes.set(field, new NpcSound(ini, field));
        break;

      case ActorSound.type:
        themes.set(field, new ActorSound(ini, field));
        break;

      case LoopedSound.type:
        themes.set(field, new LoopedSound(ini, field));
        break;

      default:
        abort("Unexpected sound type provided for loading: '%s'.", type);
    }
  }

  return themes;
}

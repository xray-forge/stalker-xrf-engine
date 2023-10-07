import { ini_file } from "xray16";

import { AbstractPlayableSound } from "@/engine/core/managers/sounds/objects";
import { IDynamicMusicDescriptor } from "@/engine/core/managers/sounds/sounds_types";
import { StoryManager } from "@/engine/core/managers/sounds/stories";
import { readIniThemesList } from "@/engine/core/managers/sounds/utils/sounds_init";
import { IniFile, TName, TNumberId, TStringId } from "@/engine/lib/types";

export const SCRIPT_SOUND_LTX: IniFile = new ini_file("sounds\\script_sound.ltx");

export const soundsConfig = {
  themes: readIniThemesList(SCRIPT_SOUND_LTX),
  playing: new LuaTable<TNumberId, AbstractPlayableSound>(),
  looped: new LuaTable<TNumberId, LuaTable<TName, AbstractPlayableSound>>(),
  managers: new LuaTable<TStringId, StoryManager>(),
  dynamicMusicThemes: $fromArray<IDynamicMusicDescriptor>([
    {
      files: $fromArray(["music_combat_theme1_part_1", "music_combat_theme1_part_2", "music_combat_theme1_part_3"]),
    },
    {
      files: $fromArray(["music_combat_theme2_part_1", "music_combat_theme2_part_2", "music_combat_theme2_part_3"]),
    },
    {
      files: $fromArray(["music_combat_theme3_part_1", "music_combat_theme3_part_2", "music_combat_theme3_part_3"]),
    },
    {
      files: $fromArray(["music_combat_theme4_part_1", "music_combat_theme4_part_2", "music_combat_theme4_part_3"]),
    },
  ]),
};

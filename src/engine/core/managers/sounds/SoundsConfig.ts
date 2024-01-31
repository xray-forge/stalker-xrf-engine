import { ini_file } from "xray16";

import { AbstractPlayableSound } from "@/engine/core/managers/sounds/objects";
import { StoryManager } from "@/engine/core/managers/sounds/stories";
import { readIniThemesList } from "@/engine/core/managers/sounds/utils/sounds_init";
import { IniFile, TName, TNumberId, TStringId } from "@/engine/lib/types";

export const SCRIPT_SOUND_LTX: IniFile = new ini_file("managers\\sounds\\script_sound.ltx");
export const SOUND_STORIES_LTX: IniFile = new ini_file("managers\\sounds\\sound_stories.ltx");

export const soundsConfig = {
  themes: readIniThemesList(SCRIPT_SOUND_LTX),
  playing: new LuaTable<TNumberId, AbstractPlayableSound>(),
  looped: new LuaTable<TNumberId, LuaTable<TName, AbstractPlayableSound>>(),
  managers: new LuaTable<TStringId, StoryManager>(),
};

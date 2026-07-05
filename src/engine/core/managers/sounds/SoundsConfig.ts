import { ini_file } from "xray16";
import { IniFile } from "xray16/alias";
import { TName, TNumberId, TStringId } from "xray16/lib";

import { AbstractPlayableSound } from "@/engine/core/managers/sounds/objects";
import { StoryManager } from "@/engine/core/managers/sounds/stories";
import { readIniThemesList } from "@/engine/core/managers/sounds/utils/sounds_init";

export const SCRIPT_SOUND_LTX: IniFile = new ini_file("managers\\sounds\\script_sound.ltx");
export const SOUND_STORIES_LTX: IniFile = new ini_file("managers\\sounds\\sound_stories.ltx");

export const soundsConfig = {
  themes: readIniThemesList(SCRIPT_SOUND_LTX),
  playing: new LuaTable<TNumberId, AbstractPlayableSound>(),
  looped: new LuaTable<TNumberId, LuaTable<TName, AbstractPlayableSound>>(),
  managers: new LuaTable<TStringId, StoryManager>(),
};

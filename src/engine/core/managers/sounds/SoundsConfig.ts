import { ini_file } from "xray16";

import { readIniThemesList } from "@/engine/core/managers/sounds/utils";
import { AbstractPlayableSound } from "@/engine/core/objects/sounds/playable_sounds";
import { StoryManager } from "@/engine/core/objects/sounds/stories";
import { IniFile, TName, TNumberId, TStringId } from "@/engine/lib/types";

export const SCRIPT_SOUND_LTX: IniFile = new ini_file("sounds\\script_sound.ltx");

export const soundsConfig = {
  generic: new LuaTable<TNumberId, AbstractPlayableSound>(),
  looped: new LuaTable<TNumberId, LuaTable<TName, AbstractPlayableSound>>(),
  themes: readIniThemesList(SCRIPT_SOUND_LTX),
  managers: new LuaTable<TStringId, StoryManager>(),
};

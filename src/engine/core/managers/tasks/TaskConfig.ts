import { ini_file } from "xray16";
import { $fromObject } from "xray16/macros";

import type { TaskObject } from "@/engine/core/managers/tasks/TaskObject";
import { readIniSectionsAsSet } from "@/engine/core/utils/ini";
import { levels } from "@/engine/lib/constants/levels";
import { storyNames } from "@/engine/lib/constants/story_names";
import { IniFile, TName, TStringId } from "@/engine/lib/types";

export const TASK_MANAGER_CONFIG_LTX: IniFile = new ini_file("managers\\task_manager.ltx");

// todo: move to config
export const GUIDERS_BY_LEVEL: LuaTable<TName, LuaTable<TName, TStringId>> = $fromObject({
  [levels.zaton]: $fromObject({
    [levels.jupiter]: storyNames.zat_b215_stalker_guide_zaton,
    [levels.pripyat]: storyNames.zat_b215_stalker_guide_zaton,
  }),
  [levels.jupiter]: $fromObject({
    [levels.zaton]: storyNames.zat_b215_stalker_guide_jupiter,
    [levels.pripyat]: storyNames.jup_b43_stalker_assistant,
  }),
  [levels.pripyat]: $fromObject({
    [levels.zaton]: storyNames.jup_b43_stalker_assistant_pri,
    [levels.jupiter]: storyNames.jup_b43_stalker_assistant_pri,
  }),
} as Record<TName, LuaTable<TName, TName>>);

export const taskConfig = {
  // Update period is randomized in min-max range to spread active tasks re-checks across frames.
  UPDATE_CHECK_PERIOD_MIN: 500,
  UPDATE_CHECK_PERIOD_MAX: 1000,
  AVAILABLE_TASKS: readIniSectionsAsSet(TASK_MANAGER_CONFIG_LTX),
  ACTIVE_TASKS: new LuaTable<TStringId, TaskObject>(),
};

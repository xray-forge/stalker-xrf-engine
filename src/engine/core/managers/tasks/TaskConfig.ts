import { ini_file } from "xray16";
import { IniFile } from "xray16/alias";
import { TName, TStringId } from "xray16/lib";
import { $fromObject } from "xray16/macros";

import { levels } from "@/engine/constants/levels";
import { storyIds } from "@/engine/constants/story_ids";
import { readIniSectionsAsSet } from "@/engine/core/ini";
import type { TaskObject } from "@/engine/core/managers/tasks/TaskObject";

export const TASK_MANAGER_CONFIG_LTX: IniFile = new ini_file("managers\\task_manager.ltx");

// todo: move to config
export const GUIDERS_BY_LEVEL: LuaTable<TName, LuaTable<TName, TStringId>> = $fromObject({
  [levels.zaton]: $fromObject({
    [levels.jupiter]: storyIds.zat_b215_stalker_guide_zaton,
    [levels.pripyat]: storyIds.zat_b215_stalker_guide_zaton,
  }),
  [levels.jupiter]: $fromObject({
    [levels.zaton]: storyIds.zat_b215_stalker_guide_jupiter,
    [levels.pripyat]: storyIds.jup_b43_stalker_assistant,
  }),
  [levels.pripyat]: $fromObject({
    [levels.zaton]: storyIds.jup_b43_stalker_assistant_pri,
    [levels.jupiter]: storyIds.jup_b43_stalker_assistant_pri,
  }),
} as Record<TName, LuaTable<TName, TName>>);

export const taskConfig = {
  // Update period is randomized in min-max range to spread active tasks re-checks across frames.
  UPDATE_CHECK_PERIOD_MIN: 500,
  UPDATE_CHECK_PERIOD_MAX: 1000,
  AVAILABLE_TASKS: readIniSectionsAsSet(TASK_MANAGER_CONFIG_LTX),
  ACTIVE_TASKS: new LuaTable<TStringId, TaskObject>(),
};

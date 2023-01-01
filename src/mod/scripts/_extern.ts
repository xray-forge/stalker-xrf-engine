import { game, get_console, level, task, TXR_TaskState, XR_CGameTask } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { getActor } from "@/mod/scripts/core/db";
import { get_task_manager } from "@/mod/scripts/se/task/TaskManager";
import * as SleepDialogModule from "@/mod/scripts/ui/interaction/SleepDialog";
import { disableInfo } from "@/mod/scripts/utils/actor";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("_extern");

log.info("Resolve externals");

// @ts-ignore global declararation
dream_callback = SleepDialogModule.dream_callback;

// @ts-ignore global declararation
dream_callback2 = SleepDialogModule.dream_callback2;

// @ts-ignore global declararation
anabiotic_callback = () => {
  level.add_cam_effector("camera_effects\\surge_01.anm", 10, false, "_extern.anabiotic_callback2");

  const rnd = math.random(35, 45);
  const m = get_global("surge_manager").get_surge_manager();

  if (m.started) {
    const tf = level.get_time_factor();
    const diff_sec = math.ceil(game.get_game_time().diffSec(m.inited_time) / tf);

    if (rnd > ((m.surge_time - diff_sec) * tf) / 60) {
      m.time_forwarded = true;
      m.ui_disabled = true;
      m.kill_all_unhided();
      m.end_surge();
    }
  }

  level.change_game_time(0, 0, rnd);
  get_global("level_weathers").get_weather_manager().forced_weather_change();
};

// @ts-ignore global declararation
anabiotic_callback2 = () => {
  get_global<AnyCallablesModule>("xr_effects").enable_ui(getActor(), null);

  get_console().execute("snd_volume_music " + tostring(get_global("mus_vol")));
  get_console().execute("snd_volume_eff " + tostring(get_global("amb_vol")));

  declare_global("amb_vol", 0);
  declare_global("mus_vol", 0);

  disableInfo("anabiotic_in_process");
};

// @ts-ignore global declararation
task_complete = (task_id: string): boolean => {
  return get_task_manager().task_complete(task_id);
};

// @ts-ignore global declararation
task_fail = (task_id: string): boolean => {
  return get_task_manager().task_fail(task_id);
};

// @ts-ignore global declararation
task_callback = (target: XR_CGameTask, state: TXR_TaskState): void => {
  if (state == task.fail || state == task.completed) {
    get_task_manager().task_callback(target, state == task.completed);
  }
};

import { ini_file, XR_CGameTask, XR_ini_file, XR_LuaBindBase, XR_net_packet } from "xray16";

import { Optional } from "@/mod/lib/types";
import { ITaskObject, TaskObject } from "@/mod/scripts/se/task/TaskObject";
import { abort } from "@/mod/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { getTableSize } from "@/mod/scripts/utils/table";

let taskManager: Optional<ITaskManager> = null;
const log: LuaLogger = new LuaLogger("TaskManager");

export interface ITaskManager extends XR_LuaBindBase {
  task_ini: XR_ini_file;
  task_info: LuaTable<string, ITaskObject>;

  save(packet: XR_net_packet): void;
  load(packet: XR_net_packet): void;
  give_task(task_id: string): void;
  task_complete(task_id: string): boolean;
  task_fail(task_id: string): boolean;
  task_callback(task: XR_CGameTask, completed: boolean): boolean;
}

export const TaskManager: ITaskManager = declare_xr_class("TaskManager", null, {
  __init(): void {
    this.task_ini = new ini_file("misc\\task_manager.ltx");
    this.task_info = new LuaTable();
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "TaskManager");

    const n = getTableSize(this.task_info);

    packet.w_u16(n);

    for (const [k, v] of this.task_info) {
      packet.w_stringZ(k);
      this.task_info.get(k).save(packet);
    }

    setSaveMarker(packet, true, "TaskManager");
  },
  load(packet: XR_net_packet): void {
    setLoadMarker(packet, false, "TaskManager");

    const n = packet.r_u16();

    for (const i of $range(1, n)) {
      const id: string = packet.r_stringZ();
      const obj: ITaskObject = create_xr_class_instance(TaskObject, this.task_ini, id);

      obj.load(packet);
      this.task_info.set(id, obj);
    }

    setLoadMarker(packet, true, "TaskManager");
  },
  give_task(task_id: string): void {
    log.info("Give task:", task_id);

    if (!this.task_ini.section_exist(task_id)) {
      abort("There is no task [%s] in task ini_file or ini_file is not included!!!", task_id);
    }

    this.task_info.set(task_id, create_xr_class_instance(TaskObject, this.task_ini, task_id));
    this.task_info.get(task_id).give_task();
  },
  task_complete(task_id: string): boolean {
    const task = this.task_info.get(task_id);

    if (task === null) {
      return false;
    }

    task.check_task();

    if (task.last_check_task == "complete") {
      task.give_reward();
      get_global("xr_statistic").inc_completed_quests_counter();

      return true;
    } else {
      return false;
    }
  },
  task_fail(task_id: string): boolean {
    const task = this.task_info.get(task_id);

    if (task === null) {
      return false;
    }

    task.check_task();

    return task.last_check_task == "fail" || task.last_check_task == "reversed";
  },
  task_callback(task, completed): void {
    const task_id: string = task.get_id();

    if (!this.task_info.has(task_id)) {
      return;
    }

    this.task_info.get(task_id).deactivate_task(task);
    this.task_info.delete(task_id);
  }
} as ITaskManager);

export function get_task_manager(): ITaskManager {
  if (taskManager === null) {
    taskManager = create_xr_class_instance(TaskManager);
  }

  return taskManager;
}

export function clearTaskManager(): void {
  taskManager = null;
}

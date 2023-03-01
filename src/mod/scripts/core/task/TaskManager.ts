import { ini_file, XR_CGameTask, XR_ini_file, XR_net_packet, XR_reader } from "xray16";

import { Optional } from "@/mod/lib/types";
import { StatisticsManager } from "@/mod/scripts/core/managers/StatisticsManager";
import { TaskObject } from "@/mod/scripts/core/task/TaskObject";
import { abort } from "@/mod/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { getTableSize } from "@/mod/scripts/utils/table";

let taskManager: Optional<TaskManager> = null;
const logger: LuaLogger = new LuaLogger("TaskManager");

/**
 * todo;
 */
export class TaskManager {
  public readonly task_ini: XR_ini_file;
  public readonly task_info: LuaTable<string, TaskObject>;

  public constructor() {
    this.task_ini = new ini_file("misc\\task_manager.ltx");
    this.task_info = new LuaTable();
  }

  public save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "TaskManager");

    const n = getTableSize(this.task_info);

    packet.w_u16(n);

    for (const [k, v] of this.task_info) {
      packet.w_stringZ(k);
      this.task_info.get(k).save(packet);
    }

    setSaveMarker(packet, true, "TaskManager");
  }

  public load(reader: XR_reader): void {
    setLoadMarker(reader, false, "TaskManager");

    const n = reader.r_u16();

    for (const i of $range(1, n)) {
      const id: string = reader.r_stringZ();
      const obj: TaskObject = new TaskObject(this.task_ini, id);

      obj.load(reader);
      this.task_info.set(id, obj);
    }

    setLoadMarker(reader, true, "TaskManager");
  }

  public give_task(task_id: string): void {
    logger.info("Give task:", task_id);

    if (!this.task_ini.section_exist(task_id)) {
      abort("There is no task [%s] in task ini_file or ini_file is not included!!!", task_id);
    }

    this.task_info.set(task_id, new TaskObject(this.task_ini, task_id));
    this.task_info.get(task_id).give_task();
  }

  public task_complete(task_id: string): boolean {
    const task = this.task_info.get(task_id);

    if (task === null) {
      return false;
    }

    task.check_task();

    if (task.last_check_task === "complete") {
      task.give_reward();
      StatisticsManager.getInstance().incrementCompletedQuestsCount();

      return true;
    } else {
      return false;
    }
  }

  public task_fail(task_id: string): boolean {
    const task = this.task_info.get(task_id);

    if (task === null) {
      return false;
    }

    task.check_task();

    return task.last_check_task === "fail" || task.last_check_task === "reversed";
  }

  public task_callback(task: XR_CGameTask, completed: boolean): void {
    const taskId: string = task.get_id();

    if (!this.task_info.has(taskId)) {
      return;
    }

    this.task_info.get(taskId).deactivate_task(task);
    this.task_info.delete(taskId);
  }
}

export function get_task_manager(): TaskManager {
  if (taskManager === null) {
    taskManager = new TaskManager();
  }

  return taskManager;
}

export function clearTaskManager(): void {
  taskManager = null;
}

import { XR_CGameTask, XR_ini_file, XR_net_packet, XR_reader } from "xray16";

import { Optional, TCount, TStringId } from "@/mod/lib/types";
import { TASK_MANAGER_LTX } from "@/mod/scripts/core/database";
import { AbstractCoreManager } from "@/mod/scripts/core/manager/AbstractCoreManager";
import { StatisticsManager } from "@/mod/scripts/core/manager/StatisticsManager";
import { ETaskState } from "@/mod/scripts/core/manager/tasks/ETaskState";
import { TaskObject } from "@/mod/scripts/core/manager/tasks/TaskObject";
import { abort } from "@/mod/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_save";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { getTableSize } from "@/mod/scripts/utils/table";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class TaskManager extends AbstractCoreManager {
  public readonly taskIni: XR_ini_file = TASK_MANAGER_LTX;
  public readonly taskInfo: LuaTable<TStringId, TaskObject> = new LuaTable();

  /**
   * todo;
   */
  public giveTask(taskId: TStringId): void {
    logger.info("Give actor task:", taskId);

    if (!this.taskIni.section_exist(taskId)) {
      abort("There is no task [%s] in task ini_file or ini_file is not included.", taskId);
    }

    this.taskInfo.set(taskId, new TaskObject(this.taskIni, taskId));
    this.taskInfo.get(taskId).give_task();
  }

  /**
   * todo;
   */
  public onTaskCompleted(taskId: string): boolean {
    const task: Optional<TaskObject> = this.taskInfo.get(taskId);

    if (task === null) {
      return false;
    } else {
      task.check_task();

      if (task.last_check_task === ETaskState.COMPLETE) {
        task.give_reward();
        StatisticsManager.getInstance().incrementCompletedQuestsCount();

        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * todo;
   */
  public onTaskFailed(task_id: string): boolean {
    const task: Optional<TaskObject> = this.taskInfo.get(task_id);

    if (task === null) {
      return false;
    } else {
      task.check_task();

      return task.last_check_task === ETaskState.FAIL || task.last_check_task === ETaskState.REVERSED;
    }
  }

  /**
   * todo;
   */
  public onTaskCallback(task: XR_CGameTask, isCompleted: boolean): void {
    const taskId: TStringId = task.get_id();

    if (this.taskInfo.has(taskId)) {
      this.taskInfo.get(taskId).deactivate_task(task);
      this.taskInfo.delete(taskId);
    }
  }

  /**
   * todo;
   */
  public override save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, TaskManager.name);

    const count: TCount = getTableSize(this.taskInfo);

    packet.w_u16(count);

    for (const [k, v] of this.taskInfo) {
      packet.w_stringZ(k);
      this.taskInfo.get(k).save(packet);
    }

    setSaveMarker(packet, true, TaskManager.name);
  }

  /**
   * todo;
   */
  public override load(reader: XR_reader): void {
    setLoadMarker(reader, false, TaskManager.name);

    const count: TCount = reader.r_u16();

    for (const it of $range(1, count)) {
      const id: TStringId = reader.r_stringZ();
      const object: TaskObject = new TaskObject(this.taskIni, id);

      object.load(reader);
      this.taskInfo.set(id, object);
    }

    setLoadMarker(reader, true, TaskManager.name);
  }
}

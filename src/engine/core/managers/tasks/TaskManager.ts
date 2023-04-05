import { task, TXR_net_processor, TXR_TaskState, XR_CGameTask, XR_ini_file, XR_net_packet } from "xray16";

import { closeLoadMarker, closeSaveMarker, openSaveMarker, registry, TASK_MANAGER_LTX } from "@/engine/core/database";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { AbstractCoreManager } from "@/engine/core/managers/AbstractCoreManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { NotificationManager } from "@/engine/core/managers/notifications";
import { StatisticsManager } from "@/engine/core/managers/StatisticsManager";
import { ETaskState } from "@/engine/core/managers/tasks/ETaskState";
import { TaskObject } from "@/engine/core/managers/tasks/TaskObject";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getTableSize } from "@/engine/core/utils/table";
import { Optional, TCount, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class TaskManager extends AbstractCoreManager {
  public readonly taskIni: XR_ini_file = TASK_MANAGER_LTX;
  public readonly taskInfo: LuaTable<TStringId, TaskObject> = new LuaTable();

  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.TASK_STATE_UPDATE, this.onTaskUpdate, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.TASK_STATE_UPDATE, this.onTaskUpdate);
  }

  /**
   * todo: Description.
   */
  public giveTask(taskId: TStringId): void {
    logger.info("Give new task:", taskId);

    if (!this.taskIni.section_exist(taskId)) {
      abort("There is no task [%s] in task ini_file or ini_file is not included.", taskId);
    }

    this.taskInfo.set(taskId, new TaskObject(this.taskIni, taskId));
    this.taskInfo.get(taskId).give_task();
  }

  /**
   * todo: Description.
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
   * todo: Description.
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
   * todo: Description.
   */
  public onTaskUpdate(taskObject: XR_CGameTask, state: TXR_TaskState): void {
    const taskId: TStringId = taskObject.get_id();

    logger.info("Task update:", taskId, state, state !== task.fail);

    if (state !== task.fail) {
      NotificationManager.getInstance().sendTaskNotification(
        registry.actor,
        state === task.completed ? ETaskState.COMPLETE : ETaskState.NEW,
        taskObject
      );
    }

    if (state === task.fail || state === task.completed) {
      if (this.taskInfo.has(taskId)) {
        this.taskInfo.get(taskId).deactivate_task(taskObject);
        this.taskInfo.delete(taskId);
      }
    }
  }

  /**
   * todo: Description.
   */
  public override save(packet: XR_net_packet): void {
    openSaveMarker(packet, TaskManager.name);

    const count: TCount = getTableSize(this.taskInfo);

    packet.w_u16(count);

    for (const [k, v] of this.taskInfo) {
      packet.w_stringZ(k);
      this.taskInfo.get(k).save(packet);
    }

    closeSaveMarker(packet, TaskManager.name);
  }

  /**
   * todo: Description.
   */
  public override load(reader: TXR_net_processor): void {
    openLoadMarker(reader, TaskManager.name);

    const count: TCount = reader.r_u16();

    for (const it of $range(1, count)) {
      const id: TStringId = reader.r_stringZ();
      const object: TaskObject = new TaskObject(this.taskIni, id);

      object.load(reader);
      this.taskInfo.set(id, object);
    }

    closeLoadMarker(reader, TaskManager.name);
  }
}

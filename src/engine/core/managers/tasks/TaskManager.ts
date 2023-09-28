import { task } from "xray16";

import { closeLoadMarker, closeSaveMarker, openLoadMarker, openSaveMarker } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { NotificationManager } from "@/engine/core/managers/notifications";
import { TASK_MANAGER_CONFIG_LTX } from "@/engine/core/managers/tasks/TaskConfig";
import { TaskObject } from "@/engine/core/managers/tasks/TaskObject";
import { ETaskState } from "@/engine/core/managers/tasks/types";
import { assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { GameTask, NetPacket, NetProcessor, Optional, TCount, TStringId, TTaskState } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Management of current tasks lists, states, rewards and progression.
 */
export class TaskManager extends AbstractManager {
  /**
   * List of currently tracked tasks in the game.
   */
  public readonly tasksList: LuaTable<TStringId, TaskObject> = new LuaTable();

  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.TASK_STATE_UPDATE, this.onTaskStateUpdate, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.TASK_STATE_UPDATE, this.onTaskStateUpdate);
  }

  /**
   * todo: Description.
   */
  public giveTask(taskId: TStringId): void {
    logger.info("Give task:", taskId);

    assert(
      TASK_MANAGER_CONFIG_LTX.section_exist(taskId),
      "There is no task [%s] in task ini_file or ini_file is not included.",
      taskId
    );

    this.tasksList.set(taskId, new TaskObject(TASK_MANAGER_CONFIG_LTX, taskId));
    this.tasksList.get(taskId).giveTask();
  }

  /**
   * Check if task by ID is completed.
   */
  public isTaskCompleted(taskId: TStringId): boolean {
    const task: Optional<TaskObject> = this.tasksList.get(taskId);

    if (task === null) {
      return false;
    } else {
      if (task.checkTaskState() === ETaskState.COMPLETED) {
        task.giveTaskReward();
        EventsManager.emitEvent(EGameEvent.TASK_COMPLETED, task);

        logger.info("Task completed:", taskId);

        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * Check if task by ID is active.
   *
   * @param taskId - identifier of task to check
   * @returns if task is active in list
   */
  public isTaskActive(taskId: TStringId): boolean {
    const task: Optional<TaskObject> = this.tasksList.get(taskId) as Optional<TaskObject>;

    return task
      ? task.state !== ETaskState.COMPLETED && task.state !== ETaskState.FAIL && task.state !== ETaskState.REVERSED
      : false;
  }

  /**
   * Check if task by id is failed.
   */
  public isTaskFailed(taskId: TStringId): boolean {
    const task: Optional<TaskObject> = this.tasksList.get(taskId);

    if (task === null) {
      return false;
    } else {
      const taskState: Optional<ETaskState> = task.checkTaskState();

      return taskState === ETaskState.FAIL || taskState === ETaskState.REVERSED;
    }
  }

  /**
   * todo: Description.
   */
  public onTaskStateUpdate(taskObject: GameTask, state: TTaskState): void {
    const taskId: TStringId = taskObject.get_id();

    logger.info("Task state update:", taskId, state, state !== task.fail);

    if (state !== task.fail) {
      NotificationManager.getInstance().sendTaskNotification(
        state === task.completed ? ETaskState.COMPLETED : ETaskState.NEW,
        taskObject
      );
    }

    if (state === task.fail || state === task.completed) {
      if (this.tasksList.has(taskId)) {
        this.tasksList.get(taskId).deactivateTask(taskObject);
        this.tasksList.delete(taskId);
      }
    }
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, TaskManager.name);

    const count: TCount = table.size(this.tasksList);

    packet.w_u16(count);

    for (const [k, v] of this.tasksList) {
      packet.w_stringZ(k);
      this.tasksList.get(k).save(packet);
    }

    closeSaveMarker(packet, TaskManager.name);
  }

  public override load(reader: NetProcessor): void {
    openLoadMarker(reader, TaskManager.name);

    const count: TCount = reader.r_u16();

    for (const it of $range(1, count)) {
      const id: TStringId = reader.r_stringZ();
      const object: TaskObject = new TaskObject(TASK_MANAGER_CONFIG_LTX, id);

      object.load(reader);
      this.tasksList.set(id, object);
    }

    closeLoadMarker(reader, TaskManager.name);
  }
}

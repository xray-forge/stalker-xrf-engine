import { task } from "xray16";

import { closeLoadMarker, closeSaveMarker, openLoadMarker, openSaveMarker } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { NotificationManager } from "@/engine/core/managers/notifications";
import { TASK_MANAGER_CONFIG_LTX, taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { TaskObject } from "@/engine/core/managers/tasks/TaskObject";
import { ETaskState } from "@/engine/core/managers/tasks/types";
import { giveTaskReward } from "@/engine/core/managers/tasks/utils";
import { assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { GameTask, NetPacket, NetProcessor, Optional, TCount, TStringId, TTaskState } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Management of current tasks lists, states, rewards and progression.
 */
export class TaskManager extends AbstractManager {
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
    assert(
      taskConfig.AVAILABLE_TASKS.has(taskId),
      "There is no task '%s' in task_manager config or ini file is not included.",
      taskId
    );

    logger.info("Give game task:", taskId);

    const task: TaskObject = new TaskObject(taskId, TASK_MANAGER_CONFIG_LTX);

    taskConfig.ACTIVE_TASKS.set(taskId, task);

    task.onGive();
  }

  /**
   * Check if task by ID is active.
   *
   * @param taskId - identifier of task to check
   * @returns if task is active in list
   */
  public isTaskActive(taskId: TStringId): boolean {
    return taskConfig.ACTIVE_TASKS.has(taskId);
  }

  /**
   * Check if task by ID is completed.
   */
  public isTaskCompleted(taskId: TStringId): boolean {
    const task: Optional<TaskObject> = taskConfig.ACTIVE_TASKS.get(taskId);

    if (task?.checkState() === ETaskState.COMPLETED) {
      giveTaskReward(task);
      EventsManager.emitEvent(EGameEvent.TASK_COMPLETED, task);

      logger.info("Task completed:", taskId);

      return true;
    }

    return false;
  }

  /**
   * Check if task by id is failed.
   *
   * @param taskId - identifier of task to check
   * @returns if task is failed
   */
  public isTaskFailed(taskId: TStringId): boolean {
    const task: Optional<TaskObject> = taskConfig.ACTIVE_TASKS.get(taskId) as Optional<TaskObject>;

    if (task) {
      const taskState: Optional<ETaskState> = task.checkState();

      return taskState === ETaskState.FAIL || taskState === ETaskState.REVERSED;
    }

    return false;
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
      const activeTask: Optional<TaskObject> = taskConfig.ACTIVE_TASKS.get(taskId) as Optional<TaskObject>;

      if (activeTask) {
        activeTask.onDeactivate(taskObject);
        taskConfig.ACTIVE_TASKS.delete(taskId);
      }
    }
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, TaskManager.name);

    const count: TCount = table.size(taskConfig.ACTIVE_TASKS);

    packet.w_u16(count);

    for (const [section, task] of taskConfig.ACTIVE_TASKS) {
      packet.w_stringZ(section);
      task.save(packet);
    }

    closeSaveMarker(packet, TaskManager.name);
  }

  public override load(reader: NetProcessor): void {
    openLoadMarker(reader, TaskManager.name);

    // Clean up tasks list since loading new info.
    taskConfig.ACTIVE_TASKS = new LuaTable();

    const count: TCount = reader.r_u16();

    for (const _ of $range(1, count)) {
      const id: TStringId = reader.r_stringZ();
      const object: TaskObject = new TaskObject(id, TASK_MANAGER_CONFIG_LTX);

      object.load(reader);

      taskConfig.ACTIVE_TASKS.set(id, object);
    }

    closeLoadMarker(reader, TaskManager.name);
  }
}

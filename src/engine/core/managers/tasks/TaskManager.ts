import { task } from "xray16";

import { closeLoadMarker, closeSaveMarker, getManager, openLoadMarker, openSaveMarker } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { NotificationManager } from "@/engine/core/managers/notifications";
import { TASK_MANAGER_CONFIG_LTX, taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
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
  public override initialize(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(EGameEvent.TASK_STATE_UPDATE, this.onTaskStateUpdate, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.unregisterCallback(EGameEvent.TASK_STATE_UPDATE, this.onTaskStateUpdate);
  }

  /**
   * @param taskId - id of the task to check
   * @returns if task is active
   */
  public isTaskActive(taskId: TStringId): boolean {
    return taskConfig.ACTIVE_TASKS.has(taskId);
  }

  /**
   * @param taskId - id of the task to check
   * @returns if task is failed
   */
  public isTaskFailed(taskId: TStringId): boolean {
    return taskConfig.ACTIVE_TASKS.get(taskId)?.isFailed() === true;
  }

  /**
   * @param taskId - id of the task to check
   * @returns if task is completed
   */
  public isTaskCompleted(taskId: TStringId): boolean {
    return taskConfig.ACTIVE_TASKS.get(taskId)?.isCompleted() === true;
  }

  /**
   * Give actor task and put it in the tasks list.
   *
   * @param taskId - id of the tasks to give for the actor
   */
  public giveTask(taskId: TStringId): void {
    assert(
      taskConfig.AVAILABLE_TASKS.has(taskId),
      "There is no task '%s' in task_manager config or ini file is not included.",
      taskId
    );

    const task: TaskObject = new TaskObject(taskId, TASK_MANAGER_CONFIG_LTX);

    taskConfig.ACTIVE_TASKS.set(taskId, task);

    task.onActivate();
  }

  /**
   * todo: Description.
   *
   * Fired from game callback event.
   */
  public onTaskStateUpdate(taskObject: GameTask, state: TTaskState): void {
    const taskId: TStringId = taskObject.get_id();

    logger.format("Task state update: %s %s %s", taskId, state, state !== task.fail);

    if (state !== task.fail) {
      getManager(NotificationManager).sendTaskNotification(
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

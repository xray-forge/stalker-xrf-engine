import { CGameTask, game, game_graph, level, task, time_global } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  getManager,
  openLoadMarker,
  openSaveMarker,
  registry,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { NotificationManager } from "@/engine/core/managers/notifications";
import { taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { ETaskState, ETaskStatus, POSSIBLE_STATES } from "@/engine/core/managers/tasks/types";
import { addGuiderSpot, giveTaskReward, removeGuiderSpot } from "@/engine/core/managers/tasks/utils";
import { assertDefined } from "@/engine/core/utils/assertion";
import { getExtern } from "@/engine/core/utils/binding";
import {
  parseConditionsList,
  parseNumberOptional,
  parseStringOptional,
  pickSectionFromCondList,
  readIniBoolean,
  readIniNumber,
  readIniString,
  TConditionList,
} from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { readTimeFromPacket, writeTimeToPacket } from "@/engine/core/utils/time";
import { TLevel } from "@/engine/lib/constants/levels";
import {
  AnyCallablesModule,
  GameTask,
  IniFile,
  LuaArray,
  NetPacket,
  NetProcessor,
  Optional,
  ServerObject,
  Time,
  TIndex,
  TLabel,
  TName,
  TNumberId,
  TRate,
  TStringId,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Task object representation containing all the logics built over C task.
 * Handles rewards / conditions / side effects from tasks.
 */
export class TaskObject {
  public readonly id: TStringId;

  public task: Optional<GameTask> = null;
  // Task state in list: selected or not.
  public status: ETaskStatus;
  public state: Optional<ETaskState> = null;

  public initializedAt: Optional<Time> = null;
  public nextUpdateAt: TTimestamp = 0;

  public title: TLabel;
  public currentTitle: Optional<TLabel> = null;
  public titleGetterFunctorName: string;

  public description: TLabel;
  public currentDescription: TLabel;
  public descriptionGetterFunctorName: TName;

  public rewardMoneyConditionList: TConditionList;
  public rewardItemsConditionList: TConditionList;

  public target: TName;
  public targetGetterFunctorName: TName;
  public currentTargetId: Optional<TNumberId> = null;

  public readonly isStorylineTask: boolean;
  public readonly isNotificationOnUpdateMuted: boolean;

  public communityRelationDeltaFail: number;
  public communityRelationDeltaComplete: number;

  public icon: TName;
  public priority: TRate;
  public spot: TLabel;

  public conditionLists: LuaArray<TConditionList>;

  public onInit: TConditionList;
  public onComplete: TConditionList;
  public onReversed: TConditionList;

  public constructor(id: TStringId, ini: IniFile) {
    this.id = id;

    this.title = readIniString(ini, id, "title", false, null, "TITLE_DOESNT_EXIST");
    this.titleGetterFunctorName = readIniString(ini, id, "title_functor", false, null, "condlist");

    this.description = readIniString(ini, id, "descr", false, null, "DESCR_DOESNT_EXIST");
    this.descriptionGetterFunctorName = readIniString(ini, id, "descr_functor", false, null, "condlist");

    this.target = readIniString(ini, id, "target", false, null, "DESCR_DOESNT_EXIST");
    this.targetGetterFunctorName = readIniString(ini, id, "target_functor", false, null, "target_condlist");

    this.icon = readIniString(ini, id, "icon", false, null, "ui_pda2_mtask_overlay");
    this.priority = readIniNumber(ini, id, "prior", false, 0);
    this.isStorylineTask = readIniBoolean(ini, id, "storyline", false, true);

    let it: TIndex = 0;

    this.conditionLists = new LuaTable();

    while (ini.line_exist(id, "condlist_" + it)) {
      this.conditionLists.set(it, parseConditionsList(ini.r_string(id, "condlist_" + it)));

      it += 1;
    }

    this.onInit = parseConditionsList(readIniString(ini, id, "on_init", false, null, ""));
    this.onComplete = parseConditionsList(readIniString(ini, id, "on_complete", false, null, ""));
    this.onReversed = parseConditionsList(readIniString(ini, id, "on_reversed", false, null, ""));

    this.rewardMoneyConditionList = parseConditionsList(readIniString(ini, id, "reward_money", false, null, ""));
    this.rewardItemsConditionList = parseConditionsList(readIniString(ini, id, "reward_item", false, null, ""));

    this.communityRelationDeltaFail = readIniNumber(ini, id, "community_relation_delta_fail", false, 0);
    this.communityRelationDeltaComplete = readIniNumber(ini, id, "community_relation_delta_complete", false, 0);

    const taskFunctors: AnyCallablesModule = getExtern<AnyCallablesModule>("task_functors");

    this.currentTitle = taskFunctors[this.titleGetterFunctorName](this.id, "title", this.title);
    this.currentDescription = taskFunctors[this.descriptionGetterFunctorName](this.id, "descr", this.description);
    this.currentTargetId = taskFunctors[this.targetGetterFunctorName](this.id, "target", this.target);

    this.status = ETaskStatus.NORMAL;
    this.spot = this.isStorylineTask ? "storyline_task_location" : "secondary_task_location";

    this.isNotificationOnUpdateMuted = readIniBoolean(ini, id, "dont_send_update_news", false, false);
  }

  /**
   * @returns whether task is completed
   */
  public isCompleted(): boolean {
    this.update();

    return this.state === ETaskState.COMPLETED;
  }

  /**
   * @returns whether task is failed
   */
  public isFailed(): boolean {
    this.update();

    return this.state === ETaskState.FAIL || this.state === ETaskState.REVERSED;
  }

  /**
   * Reverse task from script.
   * Sets state as reversed and lets other checks to do the job.
   */
  public reverse(): void {
    this.state = ETaskState.REVERSED;
  }

  /**
   * Update task state based on current game state.
   * Throttles it because game engine does a lot of calls for tasks.
   */
  public update(): Optional<ETaskState> {
    const now: TTimestamp = time_global();

    if (this.state && this.nextUpdateAt <= now) {
      return this.state;
    }

    if (this.task === null) {
      this.task = registry.actor.get_task(this.id, true) as GameTask;

      return this.state;
    }

    this.nextUpdateAt = now + taskConfig.UPDATE_CHECK_PERIOD;

    const taskFunctors: AnyCallablesModule = getExtern<AnyCallablesModule>("task_functors");
    const nextTitle: TLabel = taskFunctors[this.titleGetterFunctorName](this.id, "title", this.title);
    let isTaskUpdated: boolean = false;

    if (this.currentTitle !== nextTitle) {
      isTaskUpdated = true;
      this.currentTitle = nextTitle;
      this.task.set_title(game.translate_string(nextTitle));
    }

    const nextTargetId: TNumberId = taskFunctors[this.targetGetterFunctorName](this.id, "target", this.target);

    this.updateLevelDirection(nextTargetId);

    if (this.currentTargetId !== nextTargetId) {
      logger.info("Updated task due to target change:", this.id, this.currentTargetId, nextTargetId);

      if (this.currentTargetId === null) {
        isTaskUpdated = true;
        this.task.change_map_location(this.spot, nextTargetId);
        level.map_add_object_spot(
          nextTargetId,
          this.isStorylineTask ? "ui_storyline_task_blink" : "ui_secondary_task_blink",
          ""
        );
      } else {
        if (nextTargetId === null) {
          this.task.remove_map_locations(false);
          isTaskUpdated = true;
        } else {
          level.map_add_object_spot(
            nextTargetId,
            this.isStorylineTask ? "ui_storyline_task_blink" : "ui_secondary_task_blink",
            ""
          );

          this.task.change_map_location(this.spot, nextTargetId);
          isTaskUpdated = true;
        }
      }

      this.currentTargetId = nextTargetId;
    }

    if (isTaskUpdated && !this.isNotificationOnUpdateMuted) {
      getManager(NotificationManager).sendTaskNotification(ETaskState.UPDATED, this.task);
    }

    for (const [, conditionList] of this.conditionLists) {
      const taskState: ETaskState = pickSectionFromCondList(
        registry.actor,
        registry.actor,
        conditionList
      ) as ETaskState;

      if (taskState !== null) {
        assertDefined(POSSIBLE_STATES[taskState], "Invalid task status [%s] for task [%s]", taskState, this.title);

        this.state = taskState;

        return this.state;
      }
    }

    return this.state;
  }

  /**
   * Update direction guiding based on current level and quest target.
   * If quest target is on another level, point to guider to navigate over location.
   *
   * @param targetId - task object target id, used for getting direction
   */
  public updateLevelDirection(targetId: Optional<TNumberId>): void {
    if (!targetId || !registry.actor.is_active_task(this.task as GameTask)) {
      return;
    }

    const alifeObject: Optional<ServerObject> = registry.simulator.object(targetId);

    if (alifeObject !== null) {
      const levelName: TLevel = level.name();
      const targetLevel: TLevel = registry.simulator.level_name(
        game_graph().vertex(alifeObject.m_game_vertex_id).level_id()
      );

      if (levelName === targetLevel) {
        removeGuiderSpot(levelName);
      } else {
        addGuiderSpot(levelName, targetLevel, this.isStorylineTask);
      }
    }
  }

  /**
   * Handle task activation - addition to current tasks list.
   */
  public onActivate(): void {
    logger.info("Activate task:", this.id);

    const gameTask: GameTask = new CGameTask();

    gameTask.set_id(tostring(this.id));
    gameTask.set_type(this.isStorylineTask ? task.storyline : task.additional);
    gameTask.set_title(this.currentTitle as TLabel);
    gameTask.set_description(this.currentDescription);
    gameTask.set_priority(this.priority);
    gameTask.set_icon_name(this.icon);

    gameTask.add_complete_func("engine.is_task_completed");
    gameTask.add_fail_func("engine.is_task_failed");

    // Execute to generate side effects.
    pickSectionFromCondList(registry.actor, registry.actor, this.onInit);

    if (this.currentTargetId !== null) {
      gameTask.set_map_location(this.spot);
      gameTask.set_map_object_id(this.currentTargetId);

      level.map_add_object_spot(
        this.currentTargetId,
        this.isStorylineTask ? "ui_storyline_task_blink" : "ui_secondary_task_blink",
        ""
      );
    }

    registry.actor.give_task(gameTask, 0, false, 0);

    this.task = gameTask;
    this.status = ETaskStatus.SELECTED;
    this.initializedAt = game.get_game_time();

    EventsManager.emitEvent(EGameEvent.TASK_ACTIVATED, this);
  }

  /**
   * Handle task deactivation based on current state.
   *
   * @param task - C game task object linked to current one
   */
  public onDeactivate(task: GameTask): void {
    logger.info("Deactivate task:", this.title, this.state);

    switch (this.state) {
      case ETaskState.FAIL:
        getManager(NotificationManager).sendTaskNotification(ETaskState.FAIL, task);
        EventsManager.emitEvent(EGameEvent.TASK_FAILED, this);
        break;

      case ETaskState.REVERSED:
        pickSectionFromCondList(registry.actor, registry.actor, this.onReversed);
        getManager(NotificationManager).sendTaskNotification(ETaskState.REVERSED, task);
        EventsManager.emitEvent(EGameEvent.TASK_REVERSED, this);
        break;

      case ETaskState.COMPLETED:
        pickSectionFromCondList(registry.actor, registry.actor, this.onComplete);
        giveTaskReward(this);
        EventsManager.emitEvent(EGameEvent.TASK_COMPLETED, this);
        break;
    }

    this.nextUpdateAt = 0;
    this.state = null;
    this.status = ETaskStatus.NORMAL;
  }

  public save(packet: NetPacket): void {
    openSaveMarker(packet, TaskObject.name);

    packet.w_u8(this.status);
    writeTimeToPacket(packet, this.initializedAt);
    packet.w_stringZ(tostring(this.currentTitle));
    packet.w_stringZ(tostring(this.currentDescription));
    packet.w_stringZ(tostring(this.currentTargetId));

    closeSaveMarker(packet, TaskObject.name);
  }

  public load(reader: NetProcessor): void {
    openLoadMarker(reader, TaskObject.name);

    this.status = reader.r_u8();
    this.initializedAt = readTimeFromPacket(reader);
    this.currentTitle = parseStringOptional(reader.r_stringZ());
    this.currentDescription = parseStringOptional(reader.r_stringZ()) as TLabel;
    this.currentTargetId = parseNumberOptional(reader.r_stringZ());

    closeLoadMarker(reader, TaskObject.name);
  }
}

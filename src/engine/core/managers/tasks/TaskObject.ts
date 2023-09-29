import { CGameTask, game, game_graph, level, task, time_global } from "xray16";

import { closeLoadMarker, closeSaveMarker, openLoadMarker, openSaveMarker, registry } from "@/engine/core/database";
import { NotificationManager } from "@/engine/core/managers/notifications";
import { taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { ETaskState, ETaskStatus, POSSIBLE_STATES } from "@/engine/core/managers/tasks/types";
import { addGuiderSpot, removeGuiderSpot } from "@/engine/core/managers/tasks/utils";
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
  TStringId,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class TaskObject {
  public readonly id: TStringId;

  public gameTask: Optional<GameTask> = null;
  /**
   * Task state in list: selected or not.
   */
  public status: ETaskStatus;
  public state: Optional<ETaskState> = null;

  public initializedAt: Optional<Time> = null;
  public lastCheckedAt: Optional<TTimestamp> = null;

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
  public priority: number;
  public spot: string;

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
   * todo: Description.
   */
  public checkState(): Optional<ETaskState> {
    const now: TTimestamp = time_global();

    if (
      this.lastCheckedAt !== null &&
      this.state !== null &&
      now - this.lastCheckedAt <= taskConfig.UPDATE_CHECK_PERIOD
    ) {
      return this.state;
    }

    if (this.gameTask === null) {
      this.gameTask = registry.actor.get_task(this.id, true) as GameTask;

      return this.state;
    }

    this.lastCheckedAt = now;

    const taskFunctors: AnyCallablesModule = getExtern<AnyCallablesModule>("task_functors");
    const nextTitle: TLabel = taskFunctors[this.titleGetterFunctorName](this.id, "title", this.title);
    let isTaskUpdated: boolean = false;

    if (this.currentTitle !== nextTitle) {
      isTaskUpdated = true;
      this.currentTitle = nextTitle;
      this.gameTask.set_title(game.translate_string(nextTitle));
    }

    const nextTargetId: TNumberId = taskFunctors[this.targetGetterFunctorName](this.id, "target", this.target);

    this.updateLevelDirection(nextTargetId);

    if (this.currentTargetId !== nextTargetId) {
      logger.info("Updated task due to target change:", this.id, this.currentTargetId, nextTargetId);

      if (this.currentTargetId === null) {
        isTaskUpdated = true;
        this.gameTask.change_map_location(this.spot, nextTargetId);

        if (this.isStorylineTask) {
          level.map_add_object_spot(nextTargetId, "ui_storyline_task_blink", "");
        } else {
          level.map_add_object_spot(nextTargetId, "ui_secondary_task_blink", "");
        }
      } else {
        if (nextTargetId === null) {
          this.gameTask.remove_map_locations(false);
          isTaskUpdated = true;
        } else {
          level.map_add_object_spot(
            nextTargetId,
            this.isStorylineTask ? "ui_storyline_task_blink" : "ui_secondary_task_blink",
            ""
          );

          this.gameTask.change_map_location(this.spot, nextTargetId);
          isTaskUpdated = true;
        }
      }

      this.currentTargetId = nextTargetId;
    }

    if (isTaskUpdated && !this.isNotificationOnUpdateMuted) {
      NotificationManager.getInstance().sendTaskNotification(ETaskState.UPDATED, this.gameTask);
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
   * todo: Description.
   */
  public updateLevelDirection(target: Optional<TNumberId>): void {
    if (!target || !registry.actor.is_active_task(this.gameTask as GameTask)) {
      return;
    }

    const alifeObject: Optional<ServerObject> = registry.simulator.object(target);

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
   * todo: Description.
   */
  public reverse(): void {
    this.state = ETaskState.REVERSED;
  }

  /**
   * todo: Description.
   */
  public onGive(): void {
    const gameTask: GameTask = new CGameTask();

    gameTask.set_id(tostring(this.id));

    if (this.isStorylineTask) {
      gameTask.set_type(task.storyline);
    } else {
      gameTask.set_type(task.additional);
    }

    gameTask.set_title(this.currentTitle!);
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

      if (this.isStorylineTask) {
        level.map_add_object_spot(this.currentTargetId, "ui_storyline_task_blink", "");
      } else {
        level.map_add_object_spot(this.currentTargetId, "ui_secondary_task_blink", "");
      }
    }

    this.status = ETaskStatus.SELECTED;
    this.initializedAt = game.get_game_time();

    registry.actor.give_task(gameTask, 0, false, 0);
    this.gameTask = gameTask;
  }

  /**
   * todo: Description.
   */
  public onDeactivate(task: GameTask): void {
    logger.info("Deactivate task:", this.title);
    this.lastCheckedAt = null;

    if (this.state === ETaskState.FAIL) {
      NotificationManager.getInstance().sendTaskNotification(ETaskState.FAIL, task);
    } else if (this.state === ETaskState.REVERSED) {
      pickSectionFromCondList(registry.actor, registry.actor, this.onReversed);
      NotificationManager.getInstance().sendTaskNotification(ETaskState.REVERSED, task);
    }

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

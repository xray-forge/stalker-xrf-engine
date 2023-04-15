import {
  alife,
  CGameTask,
  game,
  game_graph,
  level,
  task,
  time_global,
  TXR_net_processor,
  XR_CGameTask,
  XR_cse_alife_object,
  XR_CTime,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
} from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  getObjectIdByStoryId,
  openSaveMarker,
  registry,
} from "@/engine/core/database";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { ItemUpgradesManager } from "@/engine/core/managers/ItemUpgradesManager";
import { ENotificationDirection, NotificationManager } from "@/engine/core/managers/notifications";
import { ETaskState, ETaskStatus, POSSIBLE_STATES } from "@/engine/core/managers/tasks/types";
import { assertDefined } from "@/engine/core/utils/assertion";
import { getExtern } from "@/engine/core/utils/binding";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, parseStringsList, TConditionList } from "@/engine/core/utils/parse";
import { giveMoneyToActor, relocateQuestItemSection } from "@/engine/core/utils/quest_reward";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/engine/core/utils/time";
import { levels, TLevel } from "@/engine/lib/constants/levels";
import { storyNames } from "@/engine/lib/constants/story_names";
import { NIL } from "@/engine/lib/constants/words";
import {
  AnyCallablesModule,
  LuaArray,
  Optional,
  StringOptional,
  TCount,
  TDuration,
  TIndex,
  TLabel,
  TName,
  TNumberId,
  TStringId,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const guidersByLevel: LuaTable<TLevel, LuaTable<TLevel, TName>> = {
  [levels.zaton]: {
    [levels.jupiter]: storyNames.zat_b215_stalker_guide_zaton,
    [levels.pripyat]: storyNames.zat_b215_stalker_guide_zaton,
  },
  [levels.jupiter]: {
    [levels.zaton]: storyNames.zat_b215_stalker_guide_zaton,
    [levels.pripyat]: storyNames.jup_b43_stalker_assistant_pri,
  },
  [levels.pripyat]: {
    [levels.zaton]: storyNames.jup_b43_stalker_assistant_pri,
    [levels.jupiter]: storyNames.jup_b43_stalker_assistant_pri,
  },
} as any;

/**
 * todo;
 */
export class TaskObject {
  protected static readonly UPDATE_CHECK_PERIOD: TDuration = 50;

  protected static getGuiderIdByTargetLevel(targetLevel: TLevel): Optional<TNumberId> {
    const levelName: TLevel = level.name() as TLevel;
    const target: string = guidersByLevel.get(levelName) && guidersByLevel.get(levelName).get(targetLevel);

    if (target !== null) {
      return getObjectIdByStoryId(target);
    }

    return null;
  }

  public readonly id: TStringId;
  public readonly ini: XR_ini_file;

  public gameTask: Optional<XR_CGameTask> = null;
  /**
   * Task state in list: selected or not.
   */
  public status: ETaskStatus;
  public state: Optional<ETaskState> = null;

  public initializedAt: Optional<XR_CTime> = null;
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

  public constructor(ini: XR_ini_file, id: TStringId) {
    this.id = id;
    this.ini = ini;

    this.title = readIniString(ini, id, "title", false, "", "TITLE_DOESNT_EXIST");
    this.titleGetterFunctorName = readIniString(ini, id, "title_functor", false, "", "condlist");

    this.description = readIniString(ini, id, "descr", false, "", "DESCR_DOESNT_EXIST");
    this.descriptionGetterFunctorName = readIniString(ini, id, "descr_functor", false, "", "condlist");

    this.target = readIniString(ini, id, "target", false, "", "DESCR_DOESNT_EXIST");
    this.targetGetterFunctorName = readIniString(ini, id, "target_functor", false, "", "target_condlist");

    this.icon = readIniString(ini, id, "icon", false, "", "ui_pda2_mtask_overlay");
    this.priority = readIniNumber(ini, id, "prior", false, 0);
    this.isStorylineTask = readIniBoolean(ini, id, "storyline", false, true);

    let it: TIndex = 0;

    this.conditionLists = new LuaTable();

    while (ini.line_exist(id, "condlist_" + it)) {
      this.conditionLists.set(it, parseConditionsList(ini.r_string(id, "condlist_" + it)));

      it = it + 1;
    }

    this.onInit = parseConditionsList(readIniString(ini, id, "on_init", false, "", ""));
    this.onComplete = parseConditionsList(readIniString(ini, id, "on_complete", false, "", ""));
    this.onReversed = parseConditionsList(readIniString(ini, id, "on_reversed", false, "", ""));

    this.rewardMoneyConditionList = parseConditionsList(readIniString(ini, id, "reward_money", false, "", ""));
    this.rewardItemsConditionList = parseConditionsList(readIniString(ini, id, "reward_item", false, "", ""));

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
  public giveTask(): void {
    const gameTask: XR_CGameTask = new CGameTask();

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
    // todo: Rename callbacks.
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
  public checkTaskState(): Optional<ETaskState> {
    const now: TTimestamp = time_global();
    let isTaskUpdated: boolean = false;

    if (
      this.lastCheckedAt !== null &&
      this.state !== null &&
      now - this.lastCheckedAt <= TaskObject.UPDATE_CHECK_PERIOD
    ) {
      return this.state;
    }

    if (this.gameTask === null) {
      this.gameTask = registry.actor?.get_task(this.id, true) as XR_CGameTask;

      return this.state;
    }

    this.lastCheckedAt = now;

    const taskFunctors: AnyCallablesModule = getExtern<AnyCallablesModule>("task_functors");

    const nextTitle: TLabel = taskFunctors[this.titleGetterFunctorName](this.id, "title", this.title);

    if (this.currentTitle !== nextTitle) {
      isTaskUpdated = true;
      this.currentTitle = nextTitle;
      this.gameTask.set_title(game.translate_string(nextTitle));
    }

    const nextTargetId: TNumberId = taskFunctors[this.targetGetterFunctorName](this.id, "target", this.target);

    this.checkTaskLevelDirection(nextTargetId);

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
          if (this.isStorylineTask) {
            level.map_add_object_spot(nextTargetId, "ui_storyline_task_blink", "");
          } else {
            level.map_add_object_spot(nextTargetId, "ui_secondary_task_blink", "");
          }

          this.gameTask.change_map_location(this.spot, nextTargetId);
          isTaskUpdated = true;
        }
      }

      this.currentTargetId = nextTargetId;
    }

    if (isTaskUpdated && !this.isNotificationOnUpdateMuted) {
      NotificationManager.getInstance().sendTaskNotification(ETaskState.UPDATED, this.gameTask);
    }

    for (const [k, v] of this.conditionLists) {
      const taskState: ETaskState = pickSectionFromCondList(registry.actor, registry.actor, v) as ETaskState;

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
  public checkTaskLevelDirection(target: Optional<TNumberId>): void {
    if (!target || !level || registry.actor.is_active_task(this.gameTask as XR_CGameTask)) {
      return;
    }

    const alifeObject: Optional<XR_cse_alife_object> = alife().object(target);

    if (alifeObject !== null) {
      const targetLevel: TLevel = alife().level_name(game_graph().vertex(alifeObject.m_game_vertex_id).level_id());
      const levelName: TLevel = level.name();

      if (levelName === targetLevel) {
        this.removeGuiderSpot();
      } else {
        this.addGuiderSpot(targetLevel);
      }
    }
  }

  /**
   * Give possible task rewards.
   * - money
   * - items list based on task config
   */
  public giveTaskReward(): void {
    pickSectionFromCondList(registry.actor, registry.actor, this.onComplete);

    const money: Optional<string> = pickSectionFromCondList(
      registry.actor,
      registry.actor,
      this.rewardMoneyConditionList
    );
    const itemsList: Optional<string> = pickSectionFromCondList(
      registry.actor,
      registry.actor,
      this.rewardItemsConditionList
    );

    logger.info("Give task rewards:", this.id, money, itemsList);

    if (money !== null) {
      giveMoneyToActor(tonumber(money) as TCount);
    }

    if (itemsList !== null) {
      // todo: fix place where speaker is stored.
      const currentSpeaker: Optional<XR_game_object> = ItemUpgradesManager.getInstance().getCurrentSpeaker();
      const rewardItems: LuaTable<TName, TCount> = new LuaTable();

      for (const [index, name] of parseStringsList(itemsList)) {
        if (rewardItems.has(name)) {
          rewardItems.set(name, rewardItems.get(name) + 1);
        } else {
          rewardItems.set(name, 1);
        }
      }

      for (const [item, count] of rewardItems) {
        relocateQuestItemSection(currentSpeaker as XR_game_object, item, ENotificationDirection.IN, count);
      }
    }
  }

  /**
   * todo: Description.
   */
  public reverseTask(): void {
    this.state = ETaskState.REVERSED;
  }

  /**
   * todo: Description.
   */
  public deactivateTask(task: XR_CGameTask): void {
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

  /**
   * todo: Description.
   */
  public addGuiderSpot(targetLevel: TLevel): void {
    const guiderId: Optional<TNumberId> = TaskObject.getGuiderIdByTargetLevel(targetLevel);

    if (guiderId === null) {
      return;
    }

    const guiderSpot: TName = this.isStorylineTask ? "storyline_task_on_guider" : "secondary_task_on_guider";
    const guiderSpot2: TName = this.isStorylineTask ? "secondary_task_on_guider" : "storyline_task_on_guider";

    if (level.map_has_object_spot(guiderId, guiderSpot2) !== 0) {
      level.map_remove_object_spot(guiderId, guiderSpot2);
    }

    if (guiderId && level.map_has_object_spot(guiderId, guiderSpot) === 0) {
      level.map_add_object_spot(guiderId, guiderSpot, "");
    }
  }

  /**
   * todo: Description.
   */
  public removeGuiderSpot(): void {
    const levelName: TLevel = level.name();

    if (!guidersByLevel.get(levelName)) {
      return;
    }

    for (const [, guiderStoryId] of guidersByLevel.get(levelName)) {
      const guiderId: Optional<TNumberId> = getObjectIdByStoryId(guiderStoryId);

      if (guiderId !== null) {
        if (level.map_has_object_spot(guiderId, "storyline_task_on_guider") !== 0) {
          level.map_remove_object_spot(guiderId, "storyline_task_on_guider");
        }

        if (level.map_has_object_spot(guiderId, "secondary_task_on_guider") !== 0) {
          level.map_remove_object_spot(guiderId, "secondary_task_on_guider");
        }
      }
    }
  }

  /**
   * Save task object state.
   */
  public save(packet: XR_net_packet): void {
    openSaveMarker(packet, TaskObject.name);

    packet.w_u8(this.status);
    writeCTimeToPacket(packet, this.initializedAt);
    packet.w_stringZ(this.currentTitle);
    packet.w_stringZ(this.currentDescription);
    packet.w_stringZ(tostring(this.currentTargetId));

    closeSaveMarker(packet, TaskObject.name);
  }

  /**
   * Load task object state.
   */
  public load(reader: TXR_net_processor): void {
    openLoadMarker(reader, TaskObject.name);

    this.status = reader.r_u8();
    this.initializedAt = readCTimeFromPacket(reader);
    this.currentTitle = reader.r_stringZ();
    this.currentDescription = reader.r_stringZ();

    const currentTarget: StringOptional = reader.r_stringZ();

    this.currentTargetId = currentTarget === NIL ? null : (tonumber(currentTarget) as TNumberId);

    closeLoadMarker(reader, TaskObject.name);
  }
}

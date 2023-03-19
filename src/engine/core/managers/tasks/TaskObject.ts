import {
  alife,
  game,
  game_graph,
  level,
  task,
  time_global,
  XR_CGameTask,
  XR_cse_alife_object,
  XR_CTime,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
  XR_reader,
} from "xray16";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";
import { ItemUpgradesManager } from "@/engine/core/managers/ItemUpgradesManager";
import { NotificationManager } from "@/engine/core/managers/notifications/NotificationManager";
import { ETaskState } from "@/engine/core/managers/tasks/ETaskState";
import * as TaskFunctor from "@/engine/core/managers/tasks/TaskFunctor";
import { abort } from "@/engine/core/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/engine/core/utils/game_save";
import { pickSectionFromCondList } from "@/engine/core/utils/ini_config/config";
import { getConfigBoolean, getConfigNumber, getConfigString } from "@/engine/core/utils/ini_config/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, parseNames, TConditionList } from "@/engine/core/utils/parse";
import { giveMoneyToActor, relocateQuestItemSection, takeMoneyFromActor } from "@/engine/core/utils/quest_reward";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/engine/core/utils/time";
import { levels, TLevel } from "@/engine/lib/constants/levels";
import { STRINGIFIED_NIL } from "@/engine/lib/constants/words";
import { AnyCallablesModule, LuaArray, Optional, TCount, TName, TNumberId, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const guiders_by_level: LuaTable<TLevel, LuaTable<TLevel, string>> = {
  [levels.zaton]: {
    [levels.jupiter]: "zat_b215_stalker_guide_zaton",
    [levels.pripyat]: "zat_b215_stalker_guide_zaton",
  },
  [levels.jupiter]: {
    [levels.zaton]: "zat_b215_stalker_guide_jupiter",
    [levels.pripyat]: "jup_b43_stalker_assistant",
  },
  [levels.pripyat]: {
    [levels.zaton]: "jup_b43_stalker_assistant_pri",
    [levels.jupiter]: "jup_b43_stalker_assistant_pri",
  },
} as any;

const valid_values: LuaTable<string, boolean> = {
  complete: true,
  fail: true,
  reversed: true,
} as any;

const status_by_id: Record<number, string> = {
  0: "normal",
  1: "selected",
  2: "complete",
  3: "fail",
  4: "reversed",
};

const id_by_status: Record<string, number> = {
  normal: 0,
  selected: 1,
  completed: 2,
  fail: 3,
  reversed: 4,
};

/**
 * todo;
 */
export class TaskObject {
  public static get_guider(target_level: TLevel) {
    const levelName: TLevel = level.name() as TLevel;
    const target: string = guiders_by_level.get(levelName) && guiders_by_level.get(levelName).get(target_level);

    if (target !== null) {
      return getObjectIdByStoryId(target);
    }

    return null;
  }

  public task_ini: XR_ini_file;
  public id: TStringId;
  public title: string;
  public status: string;

  public last_check_task: Optional<string> = null;
  public check_time: Optional<number> = null;
  public t: Optional<XR_CGameTask> = null;

  public title_functor: string;
  public current_title: Optional<string> = null;
  public inited_time: Optional<XR_CTime> = null;

  public wait_time: Optional<number> = null;
  public descr: any;
  public descr_functor: any;
  public current_descr: any;

  public reward_money: TConditionList;
  public reward_item: unknown;

  public target: any;
  public target_functor: string;
  public current_target: Optional<any> = null;

  public dont_send_update_news: boolean;

  public community_relation_delta_fail: number;
  public community_relation_delta_complete: number;

  public icon: string;
  public prior: number;
  public spot: string;
  public storyline: boolean;
  public condlist: LuaArray<TConditionList>;

  public on_init: TConditionList;
  public on_complete: TConditionList;
  public on_reversed: TConditionList;

  /**
   * todo;
   */
  public constructor(task_ini: XR_ini_file, id: TStringId) {
    this.task_ini = task_ini;
    this.id = id;

    this.title = getConfigString(task_ini, id, "title", null, false, "", "TITLE_DOESNT_EXIST");
    this.title_functor = getConfigString(task_ini, id, "title_functor", null, false, "", "condlist");

    this.descr = getConfigString(task_ini, id, "descr", null, false, "", "DESCR_DOESNT_EXIST");
    this.descr_functor = getConfigString(task_ini, id, "descr_functor", null, false, "", "condlist");

    this.target = getConfigString(task_ini, id, "target", null, false, "", "DESCR_DOESNT_EXIST");
    this.target_functor = getConfigString(task_ini, id, "target_functor", null, false, "", "target_condlist");

    this.icon = getConfigString(task_ini, id, "icon", null, false, "", "ui_pda2_mtask_overlay");
    this.prior = getConfigNumber(task_ini, id, "prior", null, false, 0);
    this.storyline = getConfigBoolean(task_ini, id, "storyline", null, false, true);

    let i: number = 0;

    this.condlist = new LuaTable();

    while (task_ini.line_exist(id, "condlist_" + i)) {
      this.condlist.set(i, parseConditionsList(task_ini.r_string(id, "condlist_" + i)));

      i = i + 1;
    }

    this.on_init = parseConditionsList(getConfigString(task_ini, id, "on_init", null, false, "", ""));
    this.on_complete = parseConditionsList(getConfigString(task_ini, id, "on_complete", null, false, "", ""));
    this.on_reversed = parseConditionsList(getConfigString(task_ini, id, "on_reversed", null, false, "", ""));

    this.reward_money = parseConditionsList(getConfigString(task_ini, id, "reward_money", null, false, "", ""));
    this.reward_item = parseConditionsList(getConfigString(task_ini, id, "reward_item", null, false, "", ""));

    this.community_relation_delta_fail = getConfigNumber(task_ini, id, "community_relation_delta_fail", null, false, 0);
    this.community_relation_delta_complete = getConfigNumber(
      task_ini,
      id,
      "community_relation_delta_complete",
      null,
      false,
      0
    );

    this.status = "normal";

    this.current_title = (TaskFunctor as AnyCallablesModule)[this.title_functor](this.id, "title", this.title);
    this.current_descr = (TaskFunctor as AnyCallablesModule)[this.descr_functor](this.id, "descr", this.descr);

    const time = 0;

    if (this.storyline) {
      if (time === 0) {
        this.spot = "storyline_task_location";
      } else {
        this.spot = "storyline_task_location_complex_timer";
      }
    } else {
      if (time === 0) {
        this.spot = "secondary_task_location";
      } else {
        this.spot = "secondary_task_location_complex_timer";
      }
    }

    this.current_target = (TaskFunctor as AnyCallablesModule)[this.target_functor](this.id, "target", this.target);
    this.dont_send_update_news = getConfigBoolean(task_ini, id, "dont_send_update_news", null, false, false);
  }

  /**
   * todo;
   */
  public give_task(): void {
    const t = new XR_CGameTask();

    t.set_id(tostring(this.id));

    if (this.storyline) {
      t.set_type(task.storyline);
    } else {
      t.set_type(task.additional);
    }

    t.set_title(this.current_title!);
    t.set_description(this.current_descr);
    t.set_priority(this.prior);
    t.set_icon_name(this.icon);
    t.add_complete_func("engine.task_complete");
    t.add_fail_func("engine.task_fail");

    pickSectionFromCondList(registry.actor, registry.actor, this.on_init as any);

    if (this.current_target !== null) {
      t.set_map_location(this.spot);
      t.set_map_object_id(this.current_target);

      if (this.storyline) {
        level.map_add_object_spot(this.current_target, "ui_storyline_task_blink", "");
      } else {
        level.map_add_object_spot(this.current_target, "ui_secondary_task_blink", "");
      }
    }

    let time = 0;

    if (this.wait_time !== null) {
      time = this.wait_time;
    }

    this.status = "selected";
    this.inited_time = game.get_game_time();

    registry.actor.give_task(t, time * 10, false, time);
    this.t = t;
  }

  /**
   * todo;
   */
  public check_task(): void {
    const global_time = time_global();
    let task_updated = false;

    if (this.check_time !== null && this.last_check_task !== null && global_time - this.check_time <= 50) {
      return;
    }

    if (this.t === null) {
      this.t = registry.actor?.get_task(this.id, true) as XR_CGameTask;

      return;
    }

    this.check_time = global_time;

    const t_tile = (TaskFunctor as AnyCallablesModule)[this.title_functor](this.id, "title", this.title);

    if (this.current_title !== t_tile) {
      task_updated = true;
      this.current_title = t_tile;
      this.t.set_title(game.translate_string(t_tile));
    }

    const t_target = (TaskFunctor as AnyCallablesModule)[this.target_functor](this.id, "target", this.target);

    this.check_level(t_target);

    if (this.current_target !== t_target) {
      logger.info("Updated task due to target change:", this.id, this.current_target, t_target);

      if (this.current_target === null) {
        task_updated = true;
        this.t.change_map_location(this.spot, t_target);

        if (this.storyline) {
          level.map_add_object_spot(t_target, "ui_storyline_task_blink", "");
        } else {
          level.map_add_object_spot(t_target, "ui_secondary_task_blink", "");
        }
      } else {
        if (t_target === null) {
          this.t.remove_map_locations(false);
          task_updated = true;
        } else {
          if (this.storyline) {
            level.map_add_object_spot(t_target, "ui_storyline_task_blink", "");
          } else {
            level.map_add_object_spot(t_target, "ui_secondary_task_blink", "");
          }

          this.t.change_map_location(this.spot, t_target);
          task_updated = true;
        }
      }

      this.current_target = t_target;
    }

    if (task_updated && !this.dont_send_update_news) {
      NotificationManager.getInstance().sendTaskNotification(registry.actor, ETaskState.UPDATED, this.t);
    }

    for (const [k, v] of this.condlist) {
      const t = pickSectionFromCondList(registry.actor, registry.actor, v as any);

      if (t !== null) {
        if (!valid_values.get(t)) {
          abort("Invalid task status [%s] for task [%s]", t, this.title);
        }

        this.last_check_task = t;

        return;
      }
    }
  }

  /**
   * todo;
   */
  public give_reward(): void {
    logger.info("Give quest rewards:", this.id, this.t?.get_id());

    pickSectionFromCondList(registry.actor, registry.actor, this.on_complete as any);

    const money: Optional<string> = pickSectionFromCondList(registry.actor, registry.actor, this.reward_money as any);
    const itemsList: Optional<string> = pickSectionFromCondList(
      registry.actor,
      registry.actor,
      this.reward_item as any
    );
    const npc = ItemUpgradesManager.getInstance().getCurrentSpeaker();

    if (money !== null) {
      giveMoneyToActor(tonumber(money) as TCount);
    }

    if (itemsList !== null) {
      const rewardItems: LuaTable<TName, TCount> = new LuaTable();

      for (const [index, name] of parseNames(itemsList)) {
        if (!rewardItems.has(name)) {
          rewardItems.set(name, 1);
        } else {
          rewardItems.set(name, rewardItems.get(name) + 1);
        }
      }

      for (const [item, count] of rewardItems) {
        relocateQuestItemSection(npc as XR_game_object, item, "in", count);
      }
    }
  }

  /**
   * todo;
   */
  public reverse_task(): void {
    this.last_check_task = ETaskState.REVERSED;
  }

  /**
   * todo;
   */
  public deactivate_task(task: XR_CGameTask): void {
    logger.info("Deactivate task:", this.title);
    this.check_time = null;

    if (this.last_check_task === ETaskState.FAIL) {
      NotificationManager.getInstance().sendTaskNotification(registry.actor, ETaskState.FAIL, task);
    } else if (this.last_check_task === ETaskState.REVERSED) {
      pickSectionFromCondList(registry.actor, registry.actor, this.on_reversed);
      NotificationManager.getInstance().sendTaskNotification(registry.actor, ETaskState.REVERSED, task);
    }

    this.last_check_task = null;
    this.status = "normal";
  }

  /**
   * todo;
   */
  public check_level(target: Optional<TNumberId>): void {
    if (!target || registry.actor.is_active_task(this.t as XR_CGameTask)) {
      return;
    }

    if (!level) {
      return;
    }

    const alifeObject: Optional<XR_cse_alife_object> = alife().object(target);

    if (alifeObject !== null) {
      const target_level: TLevel = alife().level_name(game_graph().vertex(alifeObject.m_game_vertex_id).level_id());
      const level_name: TLevel = level.name();

      if (level_name !== target_level) {
        const guider_id: Optional<TNumberId> = TaskObject.get_guider(target_level);

        if (guider_id === null) {
          return;
        }

        let guider_spot = "";
        let guider_spot2 = "";

        if (this.storyline) {
          guider_spot = "storyline_task_on_guider";
          guider_spot2 = "secondary_task_on_guider";
        } else {
          guider_spot = "secondary_task_on_guider";
          guider_spot2 = "storyline_task_on_guider";
        }

        if (level.map_has_object_spot(guider_id, guider_spot2) !== 0) {
          level.map_remove_object_spot(guider_id, guider_spot2);
        }

        if (guider_id && level.map_has_object_spot(guider_id, guider_spot) === 0) {
          level.map_add_object_spot(guider_id, guider_spot, "");
        }
      } else {
        this.remove_guider_spot();
      }
    }
  }

  /**
   * todo;
   */
  public remove_guider_spot(): void {
    if (!guiders_by_level.get(level.name())) {
      return;
    }

    for (const [k, v] of guiders_by_level.get(level.name())) {
      const guiderId: Optional<TNumberId> = getObjectIdByStoryId(v);

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
   * todo;
   */
  public save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, TaskObject.name);

    packet.w_u8(id_by_status[this.status]);
    writeCTimeToPacket(packet, this.inited_time);
    packet.w_stringZ(this.current_title);
    packet.w_stringZ(this.current_descr);
    packet.w_stringZ(tostring(this.current_target));

    setSaveMarker(packet, true, TaskObject.name);
  }

  public load(reader: XR_reader): void {
    setLoadMarker(reader, false, TaskObject.name);

    this.status = status_by_id[reader.r_u8()];
    this.inited_time = readCTimeFromPacket(reader);
    this.current_title = reader.r_stringZ();
    this.current_descr = reader.r_stringZ();
    this.current_target = reader.r_stringZ();

    if (this.current_target === STRINGIFIED_NIL) {
      this.current_target = null;
    } else {
      this.current_target = tonumber(this.current_target);
    }

    setLoadMarker(reader, true, TaskObject.name);
  }
}

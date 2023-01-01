import {
  alife,
  game,
  game_graph,
  level,
  task,
  time_global,
  XR_CGameTask,
  XR_CTime,
  XR_ini_file,
  XR_LuaBindBase,
  XR_net_packet
} from "xray16";

import { levels, TLevel } from "@/mod/globals/levels";
import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { getActor } from "@/mod/scripts/core/db";
import { send_task } from "@/mod/scripts/core/NewsManager";
import * as TaskFunctor from "@/mod/scripts/se/task/TaskFunctor";
import { getConfigBoolean, getConfigNumber, getConfigString, parseNames } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { getStoryObjectId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/mod/scripts/utils/time";

const log: LuaLogger = new LuaLogger("TaskObject");

const guiders_by_level: LuaTable<TLevel, LuaTable<TLevel, string>> = {
  [levels.zaton]: {
    [levels.jupiter]: "zat_b215_stalker_guide_zaton",
    [levels.pripyat]: "zat_b215_stalker_guide_zaton"
  },
  [levels.jupiter]: {
    [levels.zaton]: "zat_b215_stalker_guide_jupiter",
    [levels.pripyat]: "jup_b43_stalker_assistant"
  },
  [levels.pripyat]: {
    [levels.zaton]: "jup_b43_stalker_assistant_pri",
    [levels.jupiter]: "jup_b43_stalker_assistant_pri"
  }
} as any;

const valid_values: LuaTable<string, boolean> = {
  complete: true,
  fail: true,
  reversed: true
} as any;

const status_by_id: Record<number, string> = {
  0: "normal",
  1: "selected",
  2: "completed",
  3: "fail",
  4: "reversed"
};

const id_by_status: Record<string, number> = {
  normal: 0,
  selected: 1,
  completed: 2,
  fail: 3,
  reversed: 4
};

export interface ITaskObject extends XR_LuaBindBase {
  task_ini: XR_ini_file;
  id: string;
  title: string;
  status: string;
  last_check_task: Optional<string>;
  check_time: Optional<number>;
  t: XR_CGameTask;

  title_functor: string;
  current_title: Optional<string>;
  inited_time: Optional<XR_CTime>;

  wait_time: number;
  descr: any;
  descr_functor: any;
  current_descr: any;

  reward_money: number;
  reward_item: unknown;

  target: any;
  target_functor: string;
  current_target: any;

  dont_send_update_news: boolean;

  community_relation_delta_fail: number;
  community_relation_delta_complete: number;

  icon: string;
  prior: number;
  spot: string;
  storyline: boolean;
  condlist: LuaTable<number, boolean>;

  on_init: () => void;
  on_complete: () => void;
  on_reversed: () => void;

  give_task(): void;
  check_task(): void;
  give_reward(): void;
  give_reward(): void;
  reverse_task(): void;
  deactivate_task(task: XR_CGameTask): void;
  check_level(target: Optional<number>): void;
  remove_guider_spot(): void;
  save(packet: XR_net_packet): void;
  load(packet: XR_net_packet): void;
}

export const TaskObject: ITaskObject = declare_xr_class("TaskObject", null, {
  __init(task_ini: XR_ini_file, id: string): void {
    const xr_logic = get_global<AnyCallablesModule>("xr_logic");

    this.task_ini = task_ini;

    this.id = id;

    this.title = getConfigString(task_ini, id, "title", null, false, "", "TITLE_DOESNT_EXIST");
    this.title_functor = getConfigString(task_ini, id, "title_functor", null, false, "", "condlist");

    this.current_title = null;

    this.descr = getConfigString(task_ini, id, "descr", null, false, "", "DESCR_DOESNT_EXIST");
    this.descr_functor = getConfigString(task_ini, id, "descr_functor", null, false, "", "condlist");
    this.current_descr = null;

    this.target = getConfigString(task_ini, id, "target", null, false, "", "DESCR_DOESNT_EXIST");
    this.target_functor = getConfigString(task_ini, id, "target_functor", null, false, "", "target_condlist");
    this.current_target = null;

    this.icon = getConfigString(task_ini, id, "icon", null, false, "", "ui_pda2_mtask_overlay");
    this.prior = getConfigNumber(task_ini, id, "prior", null, false, 0);
    this.storyline = getConfigBoolean(task_ini, id, "storyline", null, false, true);

    let i: number = 0;

    this.condlist = new LuaTable();

    while (task_ini.line_exist(id, "condlist_" + i)) {
      this.condlist.set(
        i,
        xr_logic.parse_condlist(null, "task_manager", "condlist", task_ini.r_string(id, "condlist_" + i))
      );

      i = i + 1;
    }

    this.on_init = xr_logic.parse_condlist(
      null,
      "task_manager",
      "condlist",
      getConfigString(task_ini, id, "on_init", null, false, "", "")
    );
    this.on_complete = xr_logic.parse_condlist(
      null,
      "task_manager",
      "condlist",
      getConfigString(task_ini, id, "on_complete", null, false, "", "")
    );
    this.on_reversed = xr_logic.parse_condlist(
      null,
      "task_manager",
      "condlist",
      getConfigString(task_ini, id, "on_reversed", null, false, "", "")
    );

    this.reward_money = xr_logic.parse_condlist(
      null,
      "task_manager",
      "condlist",
      getConfigString(task_ini, id, "reward_money", null, false, "", "")
    );
    this.reward_item = xr_logic.parse_condlist(
      null,
      "task_manager",
      "condlist",
      getConfigString(task_ini, id, "reward_item", null, false, "", "")
    );

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

    let time = 0;

    if (this.wait_time !== null) {
      time = this.wait_time;
    }

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
  },
  give_task(): void {
    const t = new XR_CGameTask();

    t.set_id(tostring(this.id));

    if (this.storyline) {
      t.set_type(task.storyline);
    } else {
      t.set_type(task.additional);
    }

    t.set_title(this.current_title);
    t.set_description(this.current_descr);
    t.set_priority(this.prior);
    t.set_icon_name(this.icon);
    t.add_complete_func("_extern.task_complete");
    t.add_fail_func("_extern.task_fail");

    get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(getActor(), getActor(), this.on_init);

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

    getActor()!.give_task(t, time * 10, false, time);
    this.t = t;
  },
  check_task(): void {
    const global_time = time_global();
    let task_updated = false;

    if (this.check_time !== null && this.last_check_task !== null && global_time - this.check_time <= 50) {
      return;
    }

    if (this.t === null) {
      this.t = getActor()?.get_task(this.id, true) as XR_CGameTask;

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
      log.info("Updated task dut to target change:", this.id, this.current_target, t_target);

      if (this.current_target == null) {
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
      send_task(getActor(), "updated", this.t);
    }

    for (const [k, v] of this.condlist) {
      const t = get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(getActor(), getActor(), v);

      if (t !== null) {
        if (!valid_values.get(t)) {
          abort("Invalid task status [%s] for task [%s]", t, this.title);
        }

        this.last_check_task = t;

        return;
      }
    }
  },
  give_reward(): void {
    log.info("Give quest rewards:", this.id, this.t?.get_id());

    const xr_logic = get_global<AnyCallablesModule>("xr_logic");

    xr_logic.pick_section_from_condlist(getActor(), getActor(), this.on_complete);

    const money = xr_logic.pick_section_from_condlist(getActor(), getActor(), this.reward_money);
    const items = xr_logic.pick_section_from_condlist(getActor(), getActor(), this.reward_item);

    const npc = get_global("inventory_upgrades").victim;

    if (money !== null) {
      get_global<AnyCallablesModule>("dialogs").relocate_money(npc, tonumber(money), "in");
    }

    if (items !== null) {
      const ancillary_item_table: LuaTable<string, number> = new LuaTable();

      for (const [k, v] of parseNames(items)) {
        if (!ancillary_item_table.has(v)) {
          ancillary_item_table.set(v, 1);
        } else {
          ancillary_item_table.set(v, ancillary_item_table.get(v) + 1);
        }
      }

      for (const [k, v] of ancillary_item_table) {
        get_global<AnyCallablesModule>("dialogs").relocate_item_section(npc, k, "in", v);
      }
    }
  },
  reverse_task(): void {
    this.last_check_task = "reversed";
  },
  deactivate_task(task: XR_CGameTask): void {
    log.info("Deactivate task:", this.title);
    this.check_time = null;

    if (this.last_check_task == "fail") {
      send_task(getActor(), "fail", task);
    } else if (this.last_check_task === "reversed") {
      get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(getActor(), getActor(), this.on_reversed);
      send_task(getActor(), "reversed", task);
    }

    this.last_check_task = null;
    this.status = "normal";
  },
  check_level(target: Optional<number>): void {
    if (!target || getActor()!.is_active_task(this.t)) {
      return;
    }

    if (!level) {
      return;
    }

    const s_obj = alife().object(target);

    if (s_obj !== null) {
      const target_level: TLevel = alife().level_name(game_graph().vertex(s_obj.m_game_vertex_id).level_id());
      const level_name: TLevel = level.name();

      if (level_name !== target_level) {
        const guider_id = get_guider(target_level);

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
  },
  remove_guider_spot(): void {
    if (!guiders_by_level.get(level.name())) {
      return;
    }

    for (const [k, v] of guiders_by_level.get(level.name())) {
      const guider_id = getStoryObjectId(v);

      if (guider_id !== null) {
        if (level.map_has_object_spot(guider_id, "storyline_task_on_guider") !== 0) {
          level.map_remove_object_spot(guider_id, "storyline_task_on_guider");
        }

        if (level.map_has_object_spot(guider_id, "secondary_task_on_guider") !== 0) {
          level.map_remove_object_spot(guider_id, "secondary_task_on_guider");
        }
      }
    }
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "TaskObject");

    packet.w_u8(id_by_status[this.status]);
    writeCTimeToPacket(packet, this.inited_time);
    packet.w_stringZ(this.current_title);
    packet.w_stringZ(this.current_descr);
    packet.w_stringZ(tostring(this.current_target));

    setSaveMarker(packet, true, "TaskObject");
  },
  load(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "TaskObject");

    this.status = status_by_id[packet.r_u8()];
    this.inited_time = readCTimeFromPacket(packet);
    this.current_title = packet.r_stringZ();
    this.current_descr = packet.r_stringZ();
    this.current_target = packet.r_stringZ();

    if (this.current_target === "nil") {
      this.current_target = null;
    } else {
      this.current_target = tonumber(this.current_target);
    }

    setSaveMarker(packet, true, "TaskObject");
  }
} as ITaskObject);

function get_guider(target_level: TLevel) {
  const ln: TLevel = level.name() as TLevel;
  const target: string = guiders_by_level.get(ln) && guiders_by_level.get(ln).get(target_level);

  if (target !== null) {
    return getStoryObjectId(target);
  }

  return null;
}

import { action_base, XR_action_base, XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { MoveManager } from "@/mod/scripts/core/MoveManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ActionSleeperActivity");

const sounds = {};

const state_walking = 0;
const state_sleeping = 1;

export interface IActionSleeperActivity extends XR_action_base {
  st: IStoredObject;
  move_mgr: MoveManager;
  was_reset: boolean;
  state: number;

  timer: {
    begin: Optional<number>;
    idle: Optional<number>;
    maxidle: number;
    sumidle: number;
    random: number;
  };

  reset_scheme(): void;
  activate_scheme(): void;
  callback(mode: unknown, number: number): void;
}

export const ActionSleeperActivity: IActionSleeperActivity = declare_xr_class("ActionSleeperActivity", action_base, {
  __init(npc: XR_game_object, action_name: string, st: IStoredObject): void {
    action_base.__init(this, null, action_name);
    this.st = st;

    this.move_mgr = storage.get(npc.id()).move_mgr;
    this.was_reset = false;
  },
  initialize(): void {
    action_base.initialize(this);

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.reset_scheme();
  },
  reset_scheme(): void {
    this.timer = {
      begin: null,
      idle: null,
      maxidle: 10,
      sumidle: 20,
      random: 50
    };
    /**

     *
     *   this.st.signals = {}
     *   this.state = state_walking
     *
     *   if this.st.path_walk_info == null then
     *     const patrol_main = patrol(this.st.path_main)
     *     if not patrol_main then
     *       abort("object '%s': unable to find path_main '%s' on the map",
     *           this.object:name(), this.st.path_main)
     *     end
     *
     *     const num_wayp = patrol_main:count()
     *     if num_wayp == 1 then
     *       this.st.path_walk = this.st.path_main
     *       this.st.path_walk_info = utils.path_parse_waypoints_from_arglist(this.st.path_main,
     *           1, { 0, "wp00|ret=1" })
     *       this.st.path_look = null
     *       this.st.path_look_info = null
     *     elseif num_wayp == 2 then
     *       this.st.path_walk = this.st.path_main
     *       this.st.path_walk_info = utils.path_parse_waypoints_from_arglist(this.st.path_main,
     *           2, { 1, "wp00" }, { 0, "wp01" })
     *       this.st.path_look = this.st.path_main
     *       this.st.path_look_info = utils.path_parse_waypoints_from_arglist(this.st.path_main,
     *           2, { 0, "wp00" }, { 1, "wp01|ret=1" })
     *     else
     *       abort("object '%s': path_main '%s' contains %d waypoints, while 1 or 2 were expected",
     *           this.object:name(), this.st.path_main, num_wayp)
     *     end
     *   end
     *
     *   -- ��������� �������� (true) ��������� ��������� �����, ����� �� ��������� ������ ��-�� �������������
     *   -- ������������� path_walk ���� ��� ���������������� path_look.
     *   this.move_mgr:reset(this.st.path_walk, this.st.path_walk_info, this.st.path_look, this.st.path_look_info,
     *       null, null, { obj = this, func = this.callback }, true)
     *   this.was_reset = true
     */
  },
  activate_scheme(): void {
    this.was_reset = false;
  },
  callback(mode, number: number): void {
    this.state = state_sleeping;

    /**
     *
     *   const position = null
     *   if patrol(this.st.path_main):count() == 2 then
     *     position = patrol(this.st.path_main):point(1)
     *   end
     *
     *   if this.st.wakeable then
     *     StateManager.set_state(this.object, "sit", null, null, { look_position = position })
     *   else
     *     StateManager.set_state(this.object, "sleep", null, null, { look_position = position })
     *   end
     *   return true
     */
  },
  execute(): void {
    action_base.execute(this);
    if (!this.was_reset) {
      this.reset_scheme();
    }

    if (this.state === state_walking) {
      this.move_mgr.update();

      return;
    }

    /*
     *   if this.state == state_sleeping then
     *     --        GlobalSound:set_sound(this.object, "sleep")
     *   end
     */
  },
  finalize(): void {
    // --  GlobalSound:set_sound(this.object, null)
    this.move_mgr.finalize();
    action_base.finalize(this);
  }
} as IActionSleeperActivity);

import { action_base, XR_action_base, XR_game_object } from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { MoveManager } from "@/mod/scripts/core/MoveManager";
import { set_state } from "@/mod/scripts/state_management/StateManager";
import { path_parse_waypoints } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ActionWalkerActivity");
const assoc_tbl = {
  idle: { director: ["wait"] },
  harmonica: { director: ["play_harmonica"] },
  guitar: { director: ["play_guitar"] },
  story: { director: ["wait"] }
};

export interface IActionWalkerActivity extends XR_action_base {
  st: IStoredObject;
  in_camp: Optional<boolean>;
  move_mgr: MoveManager;
  camp: any;
  avail_actions: LuaTable<number, { predicate: (n: number) => boolean }>;

  activate_scheme(loading: boolean, npc: XR_game_object): void;
  reset_scheme(loading: Optional<boolean>, npc: XR_game_object): void;
  update(): void;
  position_riched(): boolean;
  net_destroy(npc: XR_game_object): void;
}

export const ActionWalkerActivity: IActionWalkerActivity = declare_xr_class("ActionWalkerActivity", action_base, {
  __init(object: XR_game_object, action_name: string, state: IStoredObject): void {
    action_base.__init(this, null, action_name);

    this.st = state;
    this.move_mgr = storage.get(object.id()).move_mgr;

    this.st.description = "walker_camp";
    this.avail_actions = get_global("xr_animpoint_predicates").associations[this.st.description];
    this.st.approved_actions = new LuaTable();

    for (const [k, v] of this.avail_actions) {
      if (v.predicate(object.id()) === true) {
        table.insert(this.st.approved_actions, v);
      }
    }
  },
  initialize(): void {
    action_base.initialize(this);
    this.object.set_desired_position();
    this.object.set_desired_direction();
    this.reset_scheme(null, this.object);
  },
  activate_scheme(loading: boolean, npc: XR_game_object): void {
    this.st.signals = new LuaTable();
    this.reset_scheme(loading, npc);
  },
  reset_scheme(loading: Optional<boolean>, npc: XR_game_object): void {
    if (this.st.path_walk_info === null) {
      this.st.path_walk_info = path_parse_waypoints(this.st.path_walk);
    }

    if (this.st.path_look_info === null) {
      this.st.path_look_info = path_parse_waypoints(this.st.path_look);
    }

    this.move_mgr.reset(
      this.st.path_walk,
      this.st.path_walk_info,
      this.st.path_look,
      this.st.path_look_info,
      this.st.team,
      this.st.suggested_state,
      null,
      null,
      null,
      null
    );
  },
  execute(): void {
    action_base.execute(this);

    this.move_mgr.update();

    const camp = get_global<AnyCallablesModule>("sr_camp").get_current_camp(this.object.position());

    if (camp !== null && this.st.use_camp === true) {
      this.camp = camp;
      this.camp.register_npc(this.object.id());
      this.in_camp = true;
    } else {
      if (this.in_camp === true) {
        this.camp.unregister_npc(this.object.id());
        this.in_camp = null;
      }
    }

    if (!this.in_camp && this.st.sound_idle !== null) {
      GlobalSound.set_sound_play(this.object.id(), this.st.sound_idle, null, null);
    }
  },
  update(): void {
    if (this.camp === null) {
      return;
    }

    const [camp_action, is_director] = this.camp.get_camp_action(this.object.id()) as LuaMultiReturn<[string, boolean]>;

    if (!is_director) {
      return;
    }

    const tbl = assoc_tbl[camp_action as keyof typeof assoc_tbl].director as any as LuaTable<number>;
    const anim = tbl.get(math.random(tbl.length()));

    set_state(this.object, anim, null, null, null, null);
  },
  finalize(): void {
    this.move_mgr.finalize();

    if (this.in_camp === true) {
      this.camp.unregister_npc(this.object.id());
      this.in_camp = null;
    }

    action_base.finalize(this);
  },
  position_riched(): boolean {
    return this.move_mgr.arrived_to_first_waypoint();
  },
  net_destroy(npc: XR_game_object): void {
    if (this.in_camp === true) {
      this.camp.unregister_npc(npc.id());
      this.in_camp = null;
    }
  }
} as IActionWalkerActivity);

import { action_base, XR_action_base, XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { associations, IAnimpointDescriptor } from "@/mod/scripts/core/logic/animpoint_predicates";
import { CampStoryManager } from "@/mod/scripts/core/logic/CampStoryManager";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { MoveManager } from "@/mod/scripts/core/MoveManager";
import { set_state } from "@/mod/scripts/state_management/StateManager";
import { path_parse_waypoints } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionWalkerActivity");

const assoc_tbl = {
  idle: { director: ["wait"] },
  harmonica: { director: ["play_harmonica"] },
  guitar: { director: ["play_guitar"] },
  story: { director: ["wait"] },
};

export interface IActionWalkerActivity extends XR_action_base {
  state: IStoredObject;
  in_camp: Optional<boolean>;
  move_mgr: MoveManager;
  camp: Optional<CampStoryManager>;
  avail_actions: LuaTable<number, IAnimpointDescriptor>;

  activate_scheme(loading: boolean, npc: XR_game_object): void;
  reset_scheme(loading: Optional<boolean>, npc: XR_game_object): void;
  update(): void;
  position_riched(): boolean;
  net_destroy(npc: XR_game_object): void;
}

export const ActionWalkerActivity: IActionWalkerActivity = declare_xr_class("ActionWalkerActivity", action_base, {
  __init(object: XR_game_object, action_name: string, state: IStoredObject): void {
    action_base.__init(this, null, action_name);

    this.state = state;
    this.move_mgr = storage.get(object.id()).move_mgr;

    this.state.description = "walker_camp";
    this.avail_actions = associations.get(this.state.description);
    this.state.approved_actions = new LuaTable();

    for (const [k, v] of this.avail_actions) {
      if (v.predicate(object.id()) === true) {
        table.insert(this.state.approved_actions, v);
      }
    }
  },
  initialize(): void {
    action_base.initialize(this);
    this.object.set_desired_position();
    this.object.set_desired_direction();
    this.reset_scheme(null, this.object);
  },
  activate_scheme(isLoading: boolean, object: XR_game_object): void {
    this.state.signals = new LuaTable();
    this.reset_scheme(isLoading, object);
  },
  reset_scheme(loading: Optional<boolean>, npc: XR_game_object): void {
    if (this.state.path_walk_info === null) {
      this.state.path_walk_info = path_parse_waypoints(this.state.path_walk);
    }

    if (this.state.path_look_info === null) {
      this.state.path_look_info = path_parse_waypoints(this.state.path_look);
    }

    this.move_mgr.reset(
      this.state.path_walk,
      this.state.path_walk_info,
      this.state.path_look,
      this.state.path_look_info,
      this.state.team,
      this.state.suggested_state,
      null,
      null,
      null,
      null
    );
  },
  execute(): void {
    action_base.execute(this);

    this.move_mgr.update();

    const camp = CampStoryManager.get_current_camp(this.object.position());

    if (camp !== null && this.state.use_camp === true) {
      this.camp = camp;
      this.camp.register_npc(this.object.id());
      this.in_camp = true;
    } else {
      if (this.in_camp === true) {
        this.camp!.unregister_npc(this.object.id());
        this.in_camp = null;
      }
    }

    if (!this.in_camp && this.state.sound_idle !== null) {
      GlobalSound.set_sound_play(this.object.id(), this.state.sound_idle, null, null);
    }
  },
  update(): void {
    if (this.camp === null) {
      return;
    }

    const [camp_action, is_director] = (
      this.camp.get_camp_action as (this: any, it: number) => LuaMultiReturn<[string, boolean]>
    )(this.object.id());

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
      this.camp!.unregister_npc(this.object.id());
      this.in_camp = null;
    }

    action_base.finalize(this);
  },
  position_riched(): boolean {
    return this.move_mgr.arrived_to_first_waypoint();
  },
  net_destroy(npc: XR_game_object): void {
    if (this.in_camp === true) {
      this.camp!.unregister_npc(npc.id());
      this.in_camp = null;
    }
  },
} as IActionWalkerActivity);

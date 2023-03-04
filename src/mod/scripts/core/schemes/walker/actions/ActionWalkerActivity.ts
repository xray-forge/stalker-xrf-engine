import { action_base, XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { GlobalSoundManager } from "@/mod/scripts/core/managers/GlobalSoundManager";
import { associations, IAnimpointDescriptor } from "@/mod/scripts/core/schemes/animpoint/animpoint_predicates";
import { CampStoryManager } from "@/mod/scripts/core/schemes/camper/CampStoryManager";
import { StalkerMoveManager } from "@/mod/scripts/core/state_management/StalkerMoveManager";
import { set_state } from "@/mod/scripts/core/state_management/StateManager";
import { path_parse_waypoints } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionWalkerActivity");

const assoc_tbl = {
  idle: { director: ["wait"] },
  harmonica: { director: ["play_harmonica"] },
  guitar: { director: ["play_guitar"] },
  story: { director: ["wait"] },
};

/**
 * todo;
 */
@LuabindClass()
export class ActionWalkerActivity extends action_base {
  public readonly state: IStoredObject;
  public readonly moveManager: StalkerMoveManager;
  public avail_actions: LuaTable<number, IAnimpointDescriptor>;

  public in_camp: Optional<boolean> = null;
  public camp: Optional<CampStoryManager> = null;

  public constructor(state: IStoredObject, object: XR_game_object) {
    super(null, ActionWalkerActivity.__name);

    this.state = state;
    this.moveManager = registry.objects.get(object.id()).moveManager!;

    this.state.description = "walker_camp";
    this.avail_actions = associations.get(this.state.description);
    this.state.approved_actions = new LuaTable();

    for (const [k, v] of this.avail_actions) {
      if (v.predicate(object.id()) === true) {
        table.insert(this.state.approved_actions, v);
      }
    }
  }

  public override initialize(): void {
    super.initialize();
    this.object.set_desired_position();
    this.object.set_desired_direction();
    this.reset_scheme(null, this.object);
  }

  public activate_scheme(isLoading: boolean, object: XR_game_object): void {
    this.state.signals = new LuaTable();
    this.reset_scheme(isLoading, object);
  }

  public reset_scheme(loading: Optional<boolean>, npc: XR_game_object): void {
    if (this.state.path_walk_info === null) {
      this.state.path_walk_info = path_parse_waypoints(this.state.path_walk);
    }

    if (this.state.path_look_info === null) {
      this.state.path_look_info = path_parse_waypoints(this.state.path_look);
    }

    this.moveManager.reset(
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
  }

  public override execute(): void {
    super.execute();

    this.moveManager.update();

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
      GlobalSoundManager.getInstance().setSoundPlaying(this.object.id(), this.state.sound_idle, null, null);
    }
  }

  public update(): void {
    if (this.camp === null) {
      return;
    }

    const [camp_action, is_director] = this.camp.get_camp_action(this.object.id());

    if (!is_director) {
      return;
    }

    const tbl = assoc_tbl[camp_action as keyof typeof assoc_tbl].director as any as LuaTable<number>;
    const anim = tbl.get(math.random(tbl.length()));

    set_state(this.object, anim, null, null, null, null);
  }

  public override finalize(): void {
    this.moveManager.finalize();

    if (this.in_camp === true) {
      this.camp!.unregister_npc(this.object.id());
      this.in_camp = null;
    }

    super.finalize();
  }

  public position_riched(): boolean {
    return this.moveManager.arrived_to_first_waypoint();
  }

  public net_destroy(npc: XR_game_object): void {
    if (this.in_camp === true) {
      this.camp!.unregister_npc(npc.id());
      this.in_camp = null;
    }
  }
}

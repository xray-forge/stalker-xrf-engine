import {
  action_base,
  danger_object,
  game_object,
  LuabindClass,
  move,
  time_global,
  XR_game_object,
  XR_vector,
} from "xray16";

import { ITargetStateDescriptor, set_state } from "@/engine/core/objects/state/StateManager";
import { ISchemeCombatState } from "@/engine/core/schemes/combat";
import { LuaLogger } from "@/engine/core/utils/logging";
import { sendToNearestAccessibleVertex } from "@/engine/core/utils/object";
import { AnyObject, Optional, TCount, TIndex } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const act_shoot = 1;
const act_danger = 2;

/**
 * todo;
 */
@LuabindClass()
export class ActionZombieGoToDanger extends action_base {
  public state: ISchemeCombatState;
  public t: ITargetStateDescriptor = { look_object: null, look_position: null };

  public was_hit: boolean = false;
  public hit_reaction_end_time: number = 0;

  public last_state: Optional<string> = null;
  public bdo_vert_id: Optional<number> = null;
  public last_sent_vert_id: Optional<number> = null;
  public bdo_id: Optional<number> = null;

  public enemy_last_seen_pos: Optional<XR_vector> = null;
  public enemy_last_seen_vid: Optional<number> = null;

  /**
   * todo;
   */
  public constructor(state: ISchemeCombatState) {
    super(null, ActionZombieGoToDanger.__name);
    this.state = state;
  }

  /**
   * todo;
   */
  public override initialize(): void {
    super.initialize();

    // --    this.object.set_node_evaluator      ()
    // --    this.object.set_path_evaluator      ()
    this.object.set_desired_direction();
    this.object.set_detail_path_type(move.line);
    this.object.set_path_type(game_object.level_path);
    this.last_state = null;
    this.bdo_id = null;
    this.bdo_vert_id = null;
    this.last_sent_vert_id = null;
    this.state.cur_act = act_danger;
  }

  /**
   * todo;
   */
  public setState(state: string, bestEnemy: Optional<XR_game_object>, pos: Optional<XR_vector>): void {
    if (state !== this.last_state) {
      this.t.look_object = bestEnemy;
      this.t.look_position = pos;
      set_state(this.object, state, null, null, this.t, null);
      this.last_state = state;
    }
  }

  /**
   * todo;
   */
  public override execute(): void {
    super.execute();

    if (this.was_hit) {
      this.was_hit = false;
      this.hit_reaction_end_time = time_global() + 5000;
      this.setState("raid_fire", null, this.enemy_last_seen_pos);
    } else if (this.hit_reaction_end_time > time_global()) {
      // -- ���������� ���� � �������� � �����, �� ������� ��� ������ ���
    } else {
      const bd = this.object.best_danger()!;
      const bdo = bd.object();

      if (bdo && bd.type() !== danger_object.grenade) {
        if (!this.bdo_id || this.bdo_id !== bdo.id()) {
          this.bdo_id = bdo.id();
          this.bdo_vert_id = bdo.level_vertex_id();
        }

        if (this.bdo_vert_id !== this.last_sent_vert_id) {
          this.last_sent_vert_id = this.bdo_vert_id;
          sendToNearestAccessibleVertex(this.object, this.bdo_vert_id!);
        }

        this.setState("raid", null, bd.position());
      } else {
        this.setState("threat_na", null, bd.position());
      }
    }
  }

  /**
   * todo;
   */
  public override finalize(): void {
    super.finalize();
    this.state.cur_act = null;
  }

  /**
   * todo;
   */
  public hit_callback(
    object: XR_game_object,
    amount: TCount,
    direction: XR_vector,
    who: XR_game_object,
    bone_id: TIndex
  ): void {
    if (who === null) {
      return;
    }

    if (this.state.cur_act === act_danger) {
      const bd = this.object.best_danger();

      if (bd) {
        const bdo = bd.object();

        if (bdo !== null && (bd.type() === danger_object.attacked || amount > 0)) {
          this.enemy_last_seen_pos = bdo.position();
          this.enemy_last_seen_vid = bdo.level_vertex_id();
          this.was_hit = true;
        }
      }
    }
  }
}

import { action_base, CSightParams, level, look, vector, XR_action_base, XR_vector } from "xray16";

import { look_at_object, look_object_type } from "@/mod/scripts/core/state_management/direction/StateManagerDirection";
import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { vectorCmp } from "@/mod/scripts/utils/physics";

export interface IStateManagerActDirectionTurn extends XR_action_base {
  st: StateManager;

  turn(): void;
}

export const StateManagerActDirectionTurn: IStateManagerActDirectionTurn = declare_xr_class("XRClass", action_base, {
  __init(name: string, st: StateManager) {
    xr_class_super(null, name);
    this.st = st;
  },
  initialize(): void {
    // --printf("turning object %s ",this.object:name())
    action_base.initialize(this);
    this.turn();
  },
  execute(): void {
    action_base.execute(this);
    this.turn();
  },
  finalize(): void {
    action_base.finalize(this);
  },
  turn(): void {
    this.st.point_obj_dir = look_object_type(this.object, this.st);

    if (this.st.look_object !== null && level.object_by_id(this.st.look_object as number) !== null) {
      look_at_object(this.object, this.st);
    } else if (this.st.look_position !== null) {
      if (states.get(this.st.target_state).direction) {
        // --printf("SET STATE SIGHT! %s", tostring(this.st.target_state))
        this.object.set_sight(CSightParams.eSightTypeAnimationDirection, false, false);

        return;
      }

      const objectPosition: XR_vector = this.object.position();
      let dir: XR_vector = new vector().sub(this.st.look_position!, objectPosition);

      if (this.st.point_obj_dir === true) {
        dir.y = 0;
      }

      dir.normalize();

      if (vectorCmp(dir, new vector().set(0, 0, 0))) {
        const objectDirection: XR_vector = this.object.direction();

        // -- callstack()
        // printf("Before normalize direction [%s]",
        // vec_to_str(vector():sub(this.st.look_position, this.object:position())))
        // printf("You are trying to set wrong direction %s (look_pos = [%s] npc_pos = [%s])!!!", vec_to_str(dir),
        // vec_to_str(this.st.look_position), vec_to_str(this.object:position()))

        this.st.look_position = new vector().set(
          objectPosition.x + objectDirection.x,
          objectPosition.y + objectDirection.y,
          objectPosition.z + objectDirection.z
        );
        dir = this.object.direction();
      }

      // --printf("SET_SIGHT!!!act_state_mgr_direction_turn:turn() %s", vec_to_str(dir))
      this.object.set_sight(look.direction, dir, true);
    }
  }
} as IStateManagerActDirectionTurn);

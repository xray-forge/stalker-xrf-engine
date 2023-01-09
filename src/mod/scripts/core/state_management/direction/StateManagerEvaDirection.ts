import { CSightParams, property_evaluator, TXR_SightType, vector, XR_property_evaluator } from "xray16";

import {
  look_object_type,
  look_position_type
} from "@/mod/scripts/core/state_management/direction/StateManagerDirection";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { vectorCmpPrec } from "@/mod/scripts/utils/physics";

export interface IStateManagerEvaDirection extends XR_property_evaluator {
  st: StateManager;

  callback(): void;
}

export const StateManagerEvaDirection: IStateManagerEvaDirection = declare_xr_class(
  "StateManagerEvaDirection",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      if (this.st.target_state === "smartcover") {
        return true;
      }

      const sight_type = this.object.sight_params();

      if (this.st.look_object !== null) {
        if (
          sight_type.m_object == null ||
          sight_type.m_object.id() !== this.st.look_object ||
          this.st.point_obj_dir !== look_object_type(this.object, this.st)
        ) {
          return false;
        }

        this.callback();

        return true;
      }

      if (this.st.look_position !== null) {
        if (sight_type.m_sight_type !== look_position_type(this.object, this.st)) {
          // --printf("false type")
          return false;
        } else if ((sight_type.m_sight_type as TXR_SightType) == CSightParams.eSightTypeAnimationDirection) {
          return true;
        }

        const dir = new vector().sub(this.st.look_position!, this.object.position());

        if (look_object_type(this.object, this.st) == true) {
          dir.y = 0;
        }

        dir.normalize();

        if (vectorCmpPrec(sight_type.m_vector, dir, 0.01) !== true) {
          // --printf("%s false vector", this.object:name())
          // --printf("%s %s %s", sight_type.m_vector.x, sight_type.m_vector.y, sight_type.m_vector.z)
          // --printf("%s %s %s", dir.x, dir.y, dir.z)
          return false;
        }

        this.callback();

        return true;
      }

      if (sight_type.m_object !== null) {
        return false;
      }

      if (sight_type.m_sight_type !== look_position_type(this.object, this.st)) {
        return false;
      }

      this.callback();

      return true;
    },
    callback(): void {
      if (this.st.callback !== null && this.st.callback.turn_end_func !== null) {
        this.st.callback.turn_end_func(this.st.callback.obj);

        if (this.st.callback !== null) {
          this.st.callback.turn_end_func = null;
        }
      }
    }
  } as IStateManagerEvaDirection
);

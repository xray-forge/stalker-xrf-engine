import { move } from "xray16";

import { getAnimpointPriA15Loophole } from "@/engine/core/objects/animation/smart_covers/loophole_animpoint_pri_a15";
import { ISmartCoverDescriptor } from "@/engine/core/objects/animation/smart_covers/types_smart_covers";
import { Z_VECTOR, ZERO_VECTOR } from "@/engine/lib/constants/vectors";

/**
 * todo;
 */
export function getSmartCoverAnimpointPriA15(): ISmartCoverDescriptor {
  return {
    need_weapon: false,
    loopholes: $fromArray([getAnimpointPriA15Loophole("animpoint_pri_a15", ZERO_VECTOR, Z_VECTOR, Z_VECTOR)]),
    transitions: [
      {
        vertex0: "",
        vertex1: "animpoint_pri_a15",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "idle_0_idle_0",
                position: ZERO_VECTOR,
                body_state: move.standing,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "animpoint_pri_a15",
        vertex1: "",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "idle_0_idle_0",
                position: ZERO_VECTOR,
                body_state: move.standing,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
    ],
  };
}

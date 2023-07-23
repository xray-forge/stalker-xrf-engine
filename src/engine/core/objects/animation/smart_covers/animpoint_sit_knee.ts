import { move } from "xray16";

import { getAnimpointSitKneeLoophole } from "@/engine/core/objects/animation/smart_covers/loophole_animpoint_sit_knee";
import { ISmartCoverDescriptor } from "@/engine/core/objects/animation/smart_covers/types_smart_covers";
import { MZ_VECTOR, ZERO_VECTOR } from "@/engine/lib/constants/vectors";

/**
 * todo;
 */
export function getSmartCoverAnimpointSitKnee(): ISmartCoverDescriptor {
  return {
    need_weapon: false,
    loopholes: $fromArray([getAnimpointSitKneeLoophole("animpoint_sit_knee", ZERO_VECTOR, MZ_VECTOR, MZ_VECTOR)]),
    transitions: [
      {
        vertex0: "",
        vertex1: "animpoint_sit_knee",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "idle_0_to_sit_1",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "animpoint_sit_knee",
        vertex1: "",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "sit_1_lazy_idle_0",
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

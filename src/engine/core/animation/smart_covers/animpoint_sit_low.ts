import { move } from "xray16";

import { getAnimpointSitLowLoophole } from "@/engine/core/animation/smart_covers/loophole_animpoint_sit_low";
import { ISmartCoverDescriptor } from "@/engine/core/animation/smart_covers/types_smart_covers";
import { MZ_VECTOR, ZERO_VECTOR } from "@/engine/lib/constants/vectors";

/**
 * todo;
 */
export function getSmartCoverAnimpointSitLow(): ISmartCoverDescriptor {
  return {
    need_weapon: false,
    loopholes: $fromArray([getAnimpointSitLowLoophole("animpoint_sit_low", ZERO_VECTOR, MZ_VECTOR, MZ_VECTOR)]),
    transitions: [
      {
        vertex0: "",
        vertex1: "animpoint_sit_low",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "animpoint_sit_low_in_1",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "animpoint_sit_low",
        vertex1: "",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "animpoint_sit_low_out_1",
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

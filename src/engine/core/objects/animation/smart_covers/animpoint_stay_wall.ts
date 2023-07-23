import { move } from "xray16";

import { getAnimpointStayWallLoophole } from "@/engine/core/objects/animation/smart_covers/loophole_animpoint_stay_wall";
import { ISmartCoverDescriptor } from "@/engine/core/objects/animation/smart_covers/types_smart_covers";
import { MZ_VECTOR, ZERO_VECTOR } from "@/engine/lib/constants/vectors";

/**
 * todo;
 */
export function getSmartCoverAnimpointStayWall(): ISmartCoverDescriptor {
  return {
    need_weapon: false,
    loopholes: $fromArray([getAnimpointStayWallLoophole("animpoint_stay_wall", ZERO_VECTOR, MZ_VECTOR, MZ_VECTOR)]),
    transitions: [
      {
        vertex0: "",
        vertex1: "animpoint_stay_wall",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "animpoint_stay_wall_in_1",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "animpoint_stay_wall",
        vertex1: "",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "animpoint_stay_wall_out_1",
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

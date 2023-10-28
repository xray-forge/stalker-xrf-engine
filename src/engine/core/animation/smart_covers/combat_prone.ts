import { move } from "xray16";

import { getProneLoophole } from "@/engine/core/animation/smart_covers/loophole_prone";
import { ISmartCoverDescriptor } from "@/engine/core/animation/smart_covers/types_smart_covers";
import { MX_VECTOR, ZERO_VECTOR } from "@/engine/lib/constants/vectors";

/**
 * todo;
 */
export function getSmartCoverCombatProne(): ISmartCoverDescriptor {
  return {
    loopholes: $fromArray([getProneLoophole("prone", MX_VECTOR)]),
    transitions: [
      {
        vertex0: "",
        vertex1: "prone",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_9_in_front_0",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "prone",
        vertex1: "",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_9_jump_1",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
    ],
  };
}

import { move } from "xray16";

import { getAnimPriA22Loophole } from "@/engine/core/objects/animation/smart_covers/loophole_anim_pri_a22";
import { ISmartCoverDescriptor } from "@/engine/core/objects/animation/smart_covers/types_smart_covers";
import { MZ_VECTOR, ZERO_VECTOR } from "@/engine/lib/constants/vectors";

/**
 * todo;
 */
export function getSmartCoverAnimPriA22(): ISmartCoverDescriptor {
  return {
    need_weapon: false,
    loopholes: $fromArray([getAnimPriA22Loophole("anim_pri_a22", ZERO_VECTOR, MZ_VECTOR, MZ_VECTOR)]),
    transitions: [
      {
        vertex0: "",
        vertex1: "anim_pri_a22",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "pri_a22_colonel_lean_on_tabl_in",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "anim_pri_a22",
        vertex1: "",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "pri_a22_colonel_lean_on_tabl_out",
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

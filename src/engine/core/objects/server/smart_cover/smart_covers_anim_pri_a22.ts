import { move } from "xray16";

import { ISmartCoverDescriptor } from "@/engine/core/objects/server/smart_cover/smart_covers_list";
import { getAnimPriA22Loophole } from "@/engine/core/objects/server/smart_cover/smart_covers_loophole_anim_pri_a22";
import { createEmptyVector, createVector } from "@/engine/core/utils/vector";

/**
 * todo;
 */
export function getSmartCoverAnimPriA22(): ISmartCoverDescriptor {
  return {
    need_weapon: false,
    loopholes: [
      getAnimPriA22Loophole("anim_pri_a22", createVector(0, 0, 0), createVector(0, 0, -1), createVector(0, 0, -1)),
    ] as any,
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
                position: createEmptyVector(),
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
                position: createEmptyVector(),
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

import { move } from "xray16";

import { ISmartCoverDescriptor } from "@/engine/core/objects/server/smart_cover/smart_covers_list";
import { createVector } from "@/engine/core/utils/vector";

import { getProneLoophole } from "./smart_covers_loophole_prone";

/**
 * todo;
 */
export function getSmartCoverCombatProne(): ISmartCoverDescriptor {
  return {
    loopholes: [getProneLoophole("prone", createVector(-1, 0, 0))] as any,
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
                position: createVector(0, 0, 0),
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
                position: createVector(0, 0, 0),
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

import { move } from "xray16";

import { ISmartCoverDescriptor } from "@/engine/core/objects/server/smart_cover/smart_covers_list";
import { getAnimpointSitHighLoophole } from "@/engine/core/objects/server/smart_cover/smart_covers_loophole_animpoint_sit_high";
import { createVector } from "@/engine/core/utils/vector";

export function getSmartCoverAnimpointSitHigh(): ISmartCoverDescriptor {
  return {
    need_weapon: false,
    loopholes: [
      getAnimpointSitHighLoophole(
        "animpoint_sit_high",
        createVector(0, 0, 0),
        createVector(0, 0, -1),
        createVector(0, 0, -1)
      ),
    ] as any,
    transitions: [
      {
        vertex0: "",
        vertex1: "animpoint_sit_high",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "animpoint_sit_high_in_1",
                position: createVector(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "animpoint_sit_high",
        vertex1: "",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "animpoint_sit_high_out_1",
                position: createVector(0, 0, 0),
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

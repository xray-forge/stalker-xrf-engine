import { move } from "xray16";

import { ISmartCoverDescriptor } from "@/engine/core/objects/server/smart_cover/smart_covers_list";
import { getAnimpointSitLowLoophole } from "@/engine/core/objects/server/smart_cover/smart_covers_loophole_animpoint_sit_low";
import { createVector } from "@/engine/core/utils/vector";

export function getSmartCoverAnimpointSitLow(): ISmartCoverDescriptor {
  return {
    need_weapon: false,
    loopholes: [
      getAnimpointSitLowLoophole(
        "animpoint_sit_low",
        createVector(0, 0, 0),
        createVector(0, 0, -1),
        createVector(0, 0, -1)
      ),
    ] as any,
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
                position: createVector(0, 0, 0),
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

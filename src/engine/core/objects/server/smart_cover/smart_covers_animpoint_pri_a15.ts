import { move } from "xray16";

import { ISmartCoverDescriptor } from "@/engine/core/objects/server/smart_cover/smart_covers_list";
import { get_animpoint_pri_a15_loophole } from "@/engine/core/objects/server/smart_cover/smart_covers_loophole_animpoint_pri_a15";
import { createVector } from "@/engine/core/utils/vector";

export function get_smart_cover_animpoint_pri_a15(): ISmartCoverDescriptor {
  return {
    need_weapon: false,
    loopholes: [
      get_animpoint_pri_a15_loophole(
        "animpoint_pri_a15",
        createVector(0, 0, 0),
        createVector(0, 0, 1),
        createVector(0, 0, 1)
      ),
    ] as any,
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
                position: createVector(0, 0, 0),
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

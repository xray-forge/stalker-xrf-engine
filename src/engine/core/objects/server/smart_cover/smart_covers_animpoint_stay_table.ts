import { move } from "xray16";

import { ISmartCoverDescriptor } from "@/engine/core/objects/server/smart_cover/smart_covers_list";
// eslint-disable-next-line max-len
import { getAnimpointStayTableLoophole } from "@/engine/core/objects/server/smart_cover/smart_covers_loophole_animpoint_stay_table";
import { createVector } from "@/engine/core/utils/vector";

export function getSmartCoverAnimpointStayTable(): ISmartCoverDescriptor {
  return {
    need_weapon: false,
    loopholes: [
      getAnimpointStayTableLoophole(
        "animpoint_stay_table",
        createVector(0, 0, 0),
        createVector(0, 0, -1),
        createVector(0, 0, -1)
      ),
    ] as any,
    transitions: [
      {
        vertex0: "",
        vertex1: "animpoint_stay_table",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "animpoint_stay_table_in_1",
                position: createVector(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "animpoint_stay_table",
        vertex1: "",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "animpoint_stay_table_out_1",
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

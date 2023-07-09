import { move } from "xray16";

import { ISmartCoverDescriptor } from "@/engine/core/objects/server/smart_cover/smart_covers_list";
// eslint-disable-next-line max-len
import { getAnimpointSitNormalLoophole } from "@/engine/core/objects/server/smart_cover/smart_covers_loophole_animpoint_sit_normal";
import { createVector } from "@/engine/core/utils/vector";

/**
 * todo;
 */
export function getSmartCoverAnimpointSitNormal(): ISmartCoverDescriptor {
  return {
    need_weapon: false,
    loopholes: $fromArray([
      getAnimpointSitNormalLoophole(
        "animpoint_sit_normal",
        createVector(0, 0, 0),
        createVector(0, 0, -1),
        createVector(0, 0, -1)
      ),
    ]),
    transitions: [
      {
        vertex0: "",
        vertex1: "animpoint_sit_normal",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "animpoint_sit_normal_in_1",
                position: createVector(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "animpoint_sit_normal",
        vertex1: "",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "animpoint_sit_normal_out_1",
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

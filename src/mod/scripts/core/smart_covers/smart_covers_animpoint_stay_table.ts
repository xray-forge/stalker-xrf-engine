import { move, vector } from "xray16";

import { ISmartCoverDescriptor } from "@/mod/scripts/core/smart_covers/smart_covers_list";
// eslint-disable-next-line max-len
import { get_animpoint_stay_table_loophole } from "@/mod/scripts/core/smart_covers/smart_covers_loophole_animpoint_stay_table";

export function get_smart_cover_animpoint_stay_table(): ISmartCoverDescriptor {
  return {
    need_weapon: false,
    loopholes: [
      get_animpoint_stay_table_loophole(
        "animpoint_stay_table",
        new vector().set(0, 0, 0),
        new vector().set(0, 0, -1),
        new vector().set(0, 0, -1)
      ),
    ] as any,
    transitions: [
      {
        vertex0: "",
        vertex1: "animpoint_stay_table",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "functors.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "animpoint_stay_table_in_1",
                position: new vector().set(0, 0, 0),
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
            precondition_functor: "functors.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "animpoint_stay_table_out_1",
                position: new vector().set(0, 0, 0),
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
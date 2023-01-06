import { move, vector } from "xray16";

import { ISmartCoverDescriptor } from "@/mod/scripts/smart_covers/smart_covers";
import { get_animpoint_pri_a15_loophole } from "@/mod/scripts/smart_covers/smart_covers_loophole_animpoint_pri_a15";

export function get_smart_cover_animpoint_pri_a15(): ISmartCoverDescriptor {
  return {
    need_weapon: false,
    loopholes: [
      get_animpoint_pri_a15_loophole(
        "animpoint_pri_a15",
        new vector().set(0, 0, 0),
        new vector().set(0, 0, 1),
        new vector().set(0, 0, 1)
      )
    ] as any,
    transitions: [
      {
        vertex0: "",
        vertex1: "animpoint_pri_a15",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "idle_0_idle_0",
                position: new vector().set(0, 0, 0),
                body_state: move.standing,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "animpoint_pri_a15",
        vertex1: "",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "idle_0_idle_0",
                position: new vector().set(0, 0, 0),
                body_state: move.standing,
                movement_type: move.run
              }
            ]
          }
        ]
      }
    ]
  };
}

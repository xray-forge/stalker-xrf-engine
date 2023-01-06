import { move, vector } from "xray16";

import { ISmartCoverDescriptor } from "@/mod/scripts/smart_covers/smart_covers";
import { get_anim_pri_a22_loophole } from "@/mod/scripts/smart_covers/smart_covers_loophole_anim_pri_a22";

export function get_smart_cover_anim_pri_a22(): ISmartCoverDescriptor {
  return {
    need_weapon: false,
    loopholes: [
      get_anim_pri_a22_loophole(
        "anim_pri_a22",
        new vector().set(0, 0, 0),
        new vector().set(0, 0, -1),
        new vector().set(0, 0, -1)
      )
    ] as any,
    transitions: [
      {
        vertex0: "",
        vertex1: "anim_pri_a22",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "pri_a22_colonel_lean_on_tabl_in",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "anim_pri_a22",
        vertex1: "",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "pri_a22_colonel_lean_on_tabl_out",
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

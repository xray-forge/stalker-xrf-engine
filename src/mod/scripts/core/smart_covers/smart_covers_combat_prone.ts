import { move, vector } from "xray16";

import { ISmartCoverDescriptor } from "@/mod/scripts/core/smart_covers/smart_covers";

import { get_prone_loophole } from "./smart_covers_loophole_prone";

export function get_smart_cover_combat_prone(): ISmartCoverDescriptor {
  return {
    loopholes: [get_prone_loophole("prone", new vector().set(-1, 0, 0))] as any,
    transitions: [
      {
        vertex0: "",
        vertex1: "prone",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_9_in_front_0",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "prone",
        vertex1: "",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_9_jump_1",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      }
    ]
  };
}

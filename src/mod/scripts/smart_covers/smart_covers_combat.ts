import { move, vector } from "xray16";

import { ISmartCoverDescriptor } from "@/mod/scripts/smart_covers/smart_covers";
import { get_crouch_back_loophole } from "@/mod/scripts/smart_covers/smart_covers_loophole_crouch_back";
import { get_crouch_front_loophole } from "@/mod/scripts/smart_covers/smart_covers_loophole_crouch_front";
import { get_crouch_front_left_loophole } from "@/mod/scripts/smart_covers/smart_covers_loophole_crouch_front_left";
import { get_crouch_left_loophole } from "@/mod/scripts/smart_covers/smart_covers_loophole_crouch_left";
import { get_crouch_right_loophole } from "@/mod/scripts/smart_covers/smart_covers_loophole_crouch_right";
import { get_stand_back_loophole } from "@/mod/scripts/smart_covers/smart_covers_loophole_stand_back";
import { get_stand_front_left_loophole } from "@/mod/scripts/smart_covers/smart_covers_loophole_stand_front_left";
import { get_stand_front_right_loophole } from "@/mod/scripts/smart_covers/smart_covers_loophole_stand_front_right";
import { get_stand_left_loophole } from "@/mod/scripts/smart_covers/smart_covers_loophole_stand_left";
import { get_stand_right_loophole } from "@/mod/scripts/smart_covers/smart_covers_loophole_stand_right";

function get_smart_cover_combat(): ISmartCoverDescriptor {
  return {
    need_weapon: true,
    loopholes: [
      get_crouch_front_left_loophole("crouch_front_left", new vector().set(-1, 0, -0.7)),
      get_crouch_front_loophole("crouch_front", new vector().set(-1, 0, 0)),
      get_crouch_front_left_loophole("crouch_front_right", new vector().set(-1, 0, 0.7)),
      get_crouch_right_loophole("crouch_right", new vector().set(0.2, 0, 1)),
      get_crouch_back_loophole("crouch_back", new vector().set(1, 0, 0)),
      get_crouch_left_loophole("crouch_left", new vector().set(0.2, 0, -1)),

      get_stand_front_left_loophole("stand_front_left", new vector().set(-1, 0, -0.7)),
      get_stand_front_right_loophole("stand_front_right", new vector().set(-1, 0, 0.7)),
      get_stand_right_loophole("stand_right", new vector().set(0.2, 0, 1)),
      get_stand_back_loophole("stand_back", new vector().set(1, 0, 0)),
      get_stand_left_loophole("stand_left", new vector().set(0.2, 0, -1))
    ] as any,
    transitions: [
      {
        vertex0: "",
        vertex1: "crouch_front_left",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crouch_in_front_left_0",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "",
        vertex1: "crouch_front",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crouch_in_front_0",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "",
        vertex1: "crouch_front_right",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crouch_in_front_right_0",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "",
        vertex1: "crouch_right",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crouch_in_right_0",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },

      {
        vertex0: "",
        vertex1: "crouch_back",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crouch_in_back_0",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },

      {
        vertex0: "",
        vertex1: "crouch_left",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crouch_in_left_0",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "",
        vertex1: "stand_front_left",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_stand_in_front_left_0",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },

      {
        vertex0: "",
        vertex1: "stand_front_right",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_stand_in_front_right_0",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "",
        vertex1: "stand_right",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_stand_in_right_0",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "",
        vertex1: "stand_back",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_stand_in_back_0",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "",
        vertex1: "stand_left",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_stand_in_left_0",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "crouch_front_left",
        vertex1: "crouch_back",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crauch_transition_front_left_to_back",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },

      {
        vertex0: "crouch_front_left",
        vertex1: "crouch_left",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crouch_front_left_attack_idle_0",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },

      {
        vertex0: "crouch_front",
        vertex1: "crouch_back",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crauch_transition_front_right_to_back",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "crouch_front_right",
        vertex1: "crouch_back",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crauch_transition_front_right_to_back",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "crouch_left",
        vertex1: "crouch_back",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crauch_transition_left_to_back",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "crouch_right",
        vertex1: "crouch_back",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crauch_transition_right_to_back",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "crouch_back",
        vertex1: "crouch_front_left",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crauch_transition_back_to_front_left",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "crouch_back",
        vertex1: "crouch_front",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crauch_transition_back_to_front_right",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "crouch_back",
        vertex1: "crouch_front_right",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crauch_transition_back_to_front_right",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "crouch_back",
        vertex1: "crouch_left",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crauch_transition_back_to_left",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "crouch_back",
        vertex1: "crouch_right",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crauch_transition_back_to_right",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "stand_front_left",
        vertex1: "stand_back",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_stand_transition_front_left_to_back",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "stand_front_right",
        vertex1: "stand_back",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_stand_transition_front_right_to_back",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "stand_left",
        vertex1: "stand_back",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_stand_transition_left_to_back",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "stand_right",
        vertex1: "stand_back",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_stand_transition_right_to_back",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "stand_back",
        vertex1: "stand_front_left",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_stand_transition_back_to_front_left",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "stand_back",
        vertex1: "stand_front_right",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_stand_transition_back_to_front_right",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "stand_back",
        vertex1: "stand_left",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_stand_transition_back_to_left",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "stand_back",
        vertex1: "stand_right",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_stand_transition_back_to_right",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "stand_back",
        vertex1: "crouch_back",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "stand_to_crauth",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "crouch_back",
        vertex1: "stand_back",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "crouch_to_stand",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "crouch_front_left",
        vertex1: "",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_1_jump_0",
                position: new vector().set(-3, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          },
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "crouch_front",
        vertex1: "",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_2_jump_0",
                position: new vector().set(-3, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          },
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "crouch_front_right",
        vertex1: "",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_3_jump_0",
                position: new vector().set(-3, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          },
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "crouch_right",
        vertex1: "",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "crouch_back",
        vertex1: "",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "crouch_left",
        vertex1: "",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "stand_front_left",
        vertex1: "",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "stand_front_right",
        vertex1: "",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "stand_right",
        vertex1: "",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "stand_back",
        vertex1: "",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "",
                position: new vector().set(0, 0, 0),
                body_state: move.crouch,
                movement_type: move.run
              }
            ]
          }
        ]
      },
      {
        vertex0: "stand_left",
        vertex1: "",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "_functors.list.script_functor_true",
            precondition_params: "",
            actions: [
              {
                animation: "",
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

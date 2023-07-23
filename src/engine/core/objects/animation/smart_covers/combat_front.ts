import { move } from "xray16";

import { getCrouchFrontLoophole } from "@/engine/core/objects/animation/smart_covers/loophole_crouch_front";
import { getCrouchFrontLeftLoophole } from "@/engine/core/objects/animation/smart_covers/loophole_crouch_front_left";
import { getCrouchFrontRightLoophole } from "@/engine/core/objects/animation/smart_covers/loophole_crouch_front_right";
import { getStandFrontLeftLoophole } from "@/engine/core/objects/animation/smart_covers/loophole_stand_front_left";
import { getStandFrontRightLoophole } from "@/engine/core/objects/animation/smart_covers/loophole_stand_front_right";
import { ISmartCoverDescriptor } from "@/engine/core/objects/animation/smart_covers/types_smart_covers";
import { createVector } from "@/engine/core/utils/vector";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";

/**
 * todo;
 */
export function getSmartCoverCombatFront(): ISmartCoverDescriptor {
  return {
    need_weapon: true,
    loopholes: $fromArray([
      getCrouchFrontLeftLoophole("crouch_front_left", createVector(-1, 0, -0.7)),
      getCrouchFrontLoophole("crouch_front", createVector(-1, 0, 0)),
      getCrouchFrontRightLoophole("crouch_front_right", createVector(-1, 0, 0.7)),
      getStandFrontLeftLoophole("stand_front_left", createVector(-1, 0, -0.7)),
      getStandFrontRightLoophole("stand_front_right", createVector(-1, 0, 0.7)),
    ]),
    transitions: [
      {
        vertex0: "",
        vertex1: "crouch_front_left",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crouch_in_front_left_0",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "",
        vertex1: "crouch_front",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crouch_in_front_0",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },

      {
        vertex0: "",
        vertex1: "crouch_front_right",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_crouch_in_front_right_0",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "",
        vertex1: "stand_front_left",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_stand_in_front_left_0",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "",
        vertex1: "stand_front_right",
        weight: 1.0,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "loophole_stand_in_front_right_0",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "crouch_front",
        vertex1: "crouch_front_left",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "crouch_front_to_crouch_front_left",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "crouch_front",
        vertex1: "crouch_front_right",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "crouch_front_to_crouch_front_right",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "crouch_front",
        vertex1: "stand_front_left",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "crouch_front_to_stand_front_left",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "crouch_front",
        vertex1: "stand_front_right",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "crouch_front_to_stand_front_right",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "crouch_front_right",
        vertex1: "crouch_front",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "crouch_front_right_to_crouch_front",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "crouch_front_right",
        vertex1: "crouch_front_left",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "crouch_front_right_to_crouch_front_left",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "crouch_front_right",
        vertex1: "stand_front_left",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "crouch_front_right_to_stand_front_left",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "crouch_front_right",
        vertex1: "stand_front_right",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "crouch_front_right_to_stand_front_right",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "crouch_front_left",
        vertex1: "crouch_front",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "crouch_front_left_to_crouch_front",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "crouch_front_left",
        vertex1: "crouch_front_right",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "crouch_front_left_to_crouch_front_right",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "crouch_front_left",
        vertex1: "stand_front_left",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "crouch_front_left_to_stand_front_left",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "crouch_front_left",
        vertex1: "stand_front_right",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "crouch_front_left_to_stand_front_right",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "stand_front_left",
        vertex1: "crouch_front",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "stand_front_left_to_crouch_front",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "stand_front_left",
        vertex1: "crouch_front_left",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "stand_front_left_to_crouch_front_left",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "stand_front_left",
        vertex1: "crouch_front_right",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "stand_front_left_to_crouch_front_right",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "stand_front_left",
        vertex1: "stand_front_right",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "stand_front_left_to_stand_front_right",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "stand_front_right",
        vertex1: "crouch_front",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "stand_front_right_to_crouch_front",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "stand_front_right",
        vertex1: "crouch_front_left",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "stand_front_right_to_crouch_front_left",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "stand_front_right",
        vertex1: "crouch_front_right",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "stand_front_right_to_crouch_front_right",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "stand_front_right",
        vertex1: "stand_front_left",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "stand_front_right_to_stand_front_left",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "crouch_front_left",
        vertex1: "",
        weight: 1.1,
        actions: [
          /* ### {

            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions =	{
                  {
                    animation: "loophole_1_jump_0",
                    position: createVector(-3,0,0),
                    body_state: move.crouch, movement_type: move.run,
                  },
                  },
          },*/
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "crouch_front",
        vertex1: "",
        weight: 1.1,
        actions: [
          /**
             ### {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions =	{
                  {
                    animation: "loophole_2_jump_0",
                    position: createVector(-3,0,0),
                    body_state: move.crouch, movement_type: move.run,
                  },
                  },
          },
           */
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "crouch_front_right",
        vertex1: "",
        weight: 1.1,
        actions: [
          /*
             ### {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions =	{
                  {
                    animation: "loophole_3_jump_0",
                    position: createVector(-3,0,0),
                    body_state: move.crouch, movement_type: move.run,
                  },
                  },
          },
           */
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
      {
        vertex0: "stand_front_left",
        vertex1: "",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },

      {
        vertex0: "stand_front_right",
        vertex1: "",
        weight: 1.1,
        actions: [
          {
            precondition_functor: "xr_conditions.always",
            precondition_params: "",
            actions: [
              {
                animation: "",
                position: ZERO_VECTOR,
                body_state: move.crouch,
                movement_type: move.run,
              },
            ],
          },
        ],
      },
    ],
  };
}

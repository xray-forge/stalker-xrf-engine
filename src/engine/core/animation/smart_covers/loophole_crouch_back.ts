import { Vector } from "xray16/alias";
import { MX_VECTOR, Nillable, TStringId, ZERO_VECTOR } from "xray16/lib";

import { ISmartCoverLoopholeDescriptor } from "@/engine/core/animation/smart_covers/types_smart_covers";

/**
 * Create smart cover loophole descriptor for the crouching posture facing backward.
 *
 * @param id - Identifier of the loophole.
 * @param fovDirection - Field of view direction of the loophole.
 * @param position - Position of the loophole relative to the smart cover.
 * @param enterDirection - Direction to enter the loophole from.
 * @returns Smart cover loophole descriptor for the crouching posture facing backward.
 */
export function getCrouchBackLoophole(
  id: TStringId,
  fovDirection: Vector,
  position?: Nillable<Vector>,
  enterDirection?: Nillable<Vector>
): ISmartCoverLoopholeDescriptor {
  const pos: Vector = position || ZERO_VECTOR;
  const enterDir: Vector = enterDirection || MX_VECTOR;

  return {
    id: id,
    fov_position: pos,
    fov_direction: fovDirection,
    enter_direction: enterDir,
    enterable: true,
    exitable: true,
    usable: true,
    fov: 90.0,
    range: 50.0,
    actions: {
      idle: {
        animations: {
          idle: ["loophole_crouch_back_idle_0"],
        },
      },
      lookout: {
        animations: {
          idle: ["loophole_crouch_back_idle_0"],
        },
      },
      fire: {
        animations: {
          idle: ["loophole_crouch_back_attack_idle_0"],
          shoot: ["loophole_crouch_back_attack_shoot_0", "loophole_crouch_back_attack_shoot_1"],
        },
      },
      fire_no_lookout: {
        animations: {
          idle: ["loophole_crouch_back_attack_idle_0"],
          shoot: ["loophole_crouch_back_attack_shoot_0", "loophole_crouch_back_attack_shoot_1"],
        },
      },
      reload: {
        animations: {
          idle: ["loophole_crouch_back_reload_0"],
        },
      },
    },

    transitions: [
      {
        action_from: "idle",
        action_to: "lookout",
        weight: 1.2,
        animations: ["loophole_crouch_back_idle_0"],
      },
      {
        action_from: "lookout",
        action_to: "idle",
        weight: 1.2,
        animations: ["loophole_crouch_back_idle_0"],
      },
      {
        action_from: "idle",
        action_to: "fire",
        weight: 1.2,
        animations: ["loophole_crouch_back_attack_in_0"],
      },
      {
        action_from: "fire",
        action_to: "idle",
        weight: 1.2,
        animations: ["loophole_crouch_back_attack_out_0"],
      },
      {
        action_from: "idle",
        action_to: "fire_no_lookout",
        weight: 1.2,
        animations: ["loophole_crouch_back_attack_in_0"],
      },
      {
        action_from: "fire_no_lookout",
        action_to: "idle",
        weight: 1.2,
        animations: ["loophole_crouch_back_attack_out_0"],
      },
    ],
  };
}

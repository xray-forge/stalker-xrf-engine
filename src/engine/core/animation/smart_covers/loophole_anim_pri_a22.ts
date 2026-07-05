import { Vector } from "xray16/alias";
import { TStringId } from "xray16/lib";

import { ISmartCoverLoopholeDescriptor } from "@/engine/core/animation/smart_covers/types_smart_covers";
import { MX_VECTOR } from "@/engine/lib/constants/vectors";

/**
 * Create smart cover loophole descriptor for the anim_pri_a22 scene.
 *
 * @param id - Identifier of the loophole.
 * @param position - Position of the loophole relative to the smart cover.
 * @param fovDirection - Field of view direction of the loophole.
 * @param enterDirection - Direction to enter the loophole from.
 * @returns Smart cover loophole descriptor for the anim_pri_a22 scene.
 */
export function getAnimPriA22Loophole(
  id: TStringId,
  position: Vector,
  fovDirection: Vector,
  enterDirection: Vector
): ISmartCoverLoopholeDescriptor {
  return {
    id: id,
    fov_position: position,
    fov_direction: fovDirection,
    danger_fov_direction: MX_VECTOR,
    enter_direction: enterDirection,
    usable: true,
    fov: 45.0,
    danger_fov: 45.0,
    range: 70.0,
    actions: {
      idle: {
        animations: {
          idle: ["pri_a22_colonel_lean_on_tabl_idle"],
        },
      },
      lookout: {
        animations: {
          idle: ["pri_a22_colonel_lean_on_tabl_idle"],
        },
      },
      fire: {
        animations: {
          idle: ["pri_a22_colonel_lean_on_tabl_idle"],
          shoot: ["pri_a22_colonel_lean_on_tabl_idle"],
        },
      },
      fire_no_lookout: {
        animations: {
          idle: ["pri_a22_colonel_lean_on_tabl_idle"],
          shoot: ["pri_a22_colonel_lean_on_tabl_idle"],
        },
      },
      reload: {
        animations: {
          idle: ["pri_a22_colonel_lean_on_tabl_idle"],
        },
      },
    },
    transitions: [
      {
        action_from: "idle",
        action_to: "lookout",
        weight: 1.2,
        animations: ["pri_a22_colonel_lean_on_tabl_idle"],
      },
      {
        action_from: "lookout",
        action_to: "idle",
        weight: 1.2,
        animations: ["pri_a22_colonel_lean_on_tabl_idle"],
      },
      {
        action_from: "idle",
        action_to: "fire",
        weight: 1.2,
        animations: ["pri_a22_colonel_lean_on_tabl_idle"],
      },
      {
        action_from: "fire",
        action_to: "idle",
        weight: 1.2,
        animations: ["pri_a22_colonel_lean_on_tabl_idle"],
      },
      {
        action_from: "idle",
        action_to: "fire_no_lookout",
        weight: 1.2,
        animations: ["pri_a22_colonel_lean_on_tabl_idle"],
      },
      {
        action_from: "fire_no_lookout",
        action_to: "idle",
        weight: 1.2,
        animations: ["pri_a22_colonel_lean_on_tabl_idle"],
      },
    ],
  };
}

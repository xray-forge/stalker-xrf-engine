import { ISmartCoverLoopholeDescriptor } from "@/engine/core/animation/smart_covers/types_smart_covers";
import { MX_VECTOR } from "@/engine/lib/constants/vectors";
import { TStringId, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export function getAnimpointPriA15Loophole(
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
          idle: ["idle_0_idle_0"],
        },
      },
      lookout: {
        animations: {
          idle: ["idle_0_idle_0"],
        },
      },
      fire: {
        animations: {
          idle: ["idle_0_idle_0"],
          shoot: ["idle_0_idle_0"],
        },
      },
      fire_no_lookout: {
        animations: {
          idle: ["idle_0_idle_0"],
          shoot: ["idle_0_idle_0"],
        },
      },
      reload: {
        animations: {
          idle: ["idle_0_idle_0"],
        },
      },
    },
    transitions: [
      {
        action_from: "idle",
        action_to: "lookout",
        weight: 1.2,
        animations: ["idle_0_idle_0"],
      },
      {
        action_from: "lookout",
        action_to: "idle",
        weight: 1.2,
        animations: ["idle_0_idle_0"],
      },
      {
        action_from: "idle",
        action_to: "fire",
        weight: 1.2,
        animations: ["pri_a15_zulus_cam5"],
      },
      {
        action_from: "fire",
        action_to: "idle",
        weight: 1.2,
        animations: ["idle_0_idle_0"],
      },
      {
        action_from: "idle",
        action_to: "fire_no_lookout",
        weight: 1.2,
        animations: ["idle_0_idle_0"],
      },
      {
        action_from: "fire_no_lookout",
        action_to: "idle",
        weight: 1.2,
        animations: ["idle_0_idle_0"],
      },
    ],
  };
}

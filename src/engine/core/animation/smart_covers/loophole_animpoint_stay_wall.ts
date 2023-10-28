import { ISmartCoverLoopholeDescriptor } from "@/engine/core/animation/smart_covers/types_smart_covers";
import { MX_VECTOR } from "@/engine/lib/constants/vectors";
import { TStringId, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export function getAnimpointStayWallLoophole(
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
          idle: ["animpoint_stay_wall_idle_1"],
        },
      },
      lookout: {
        animations: {
          idle: ["animpoint_stay_wall_idle_1"],
        },
      },
      fire: {
        animations: {
          idle: ["animpoint_stay_wall_idle_1"],
          shoot: ["animpoint_stay_wall_idle_1"],
        },
      },
      fire_no_lookout: {
        animations: {
          idle: ["animpoint_stay_wall_idle_1"],
          shoot: ["animpoint_stay_wall_idle_1"],
        },
      },
      reload: {
        animations: {
          idle: ["animpoint_stay_wall_idle_1"],
        },
      },
    },
    transitions: [
      {
        action_from: "idle",
        action_to: "lookout",
        weight: 1.2,
        animations: ["animpoint_stay_wall_in_1"],
      },
      {
        action_from: "lookout",
        action_to: "idle",
        weight: 1.2,
        animations: ["animpoint_stay_wall_in_1"],
      },
      {
        action_from: "idle",
        action_to: "fire",
        weight: 1.2,
        animations: ["animpoint_stay_wall_in_1"],
      },
      {
        action_from: "fire",
        action_to: "idle",
        weight: 1.2,
        animations: ["animpoint_stay_wall_in_1"],
      },
      {
        action_from: "idle",
        action_to: "fire_no_lookout",
        weight: 1.2,
        animations: ["animpoint_stay_wall_in_1"],
      },
      {
        action_from: "fire_no_lookout",
        action_to: "idle",
        weight: 1.2,
        animations: ["animpoint_stay_wall_in_1"],
      },
    ],
  };
}

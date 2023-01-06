import { vector, XR_vector } from "xray16";

import { ISmartCoverLoopholeDescriptor } from "@/mod/scripts/core/smart_covers/smart_covers";

export function get_animpoint_pri_a15_loophole(
  id: string,
  position: XR_vector,
  fov_direction: XR_vector,
  enter_direction: XR_vector
): ISmartCoverLoopholeDescriptor {
  return {
    id: id,
    fov_position: position,
    fov_direction: fov_direction,
    danger_fov_direction: new vector().set(-1, 0, 0),
    enter_direction: enter_direction,
    usable: true,
    fov: 45.0,
    danger_fov: 45.0,
    range: 70.0,
    actions: {
      idle: {
        animations: {
          idle: ["idle_0_idle_0"]
        }
      },
      lookout: {
        animations: {
          idle: ["idle_0_idle_0"]
        }
      },
      fire: {
        animations: {
          idle: ["idle_0_idle_0"],
          shoot: ["idle_0_idle_0"]
        }
      },
      fire_no_lookout: {
        animations: {
          idle: ["idle_0_idle_0"],
          shoot: ["idle_0_idle_0"]
        }
      },
      reload: {
        animations: {
          idle: ["idle_0_idle_0"]
        }
      }
    },
    transitions: [
      {
        action_from: "idle",
        action_to: "lookout",
        weight: 1.2,
        animations: ["idle_0_idle_0"]
      },
      {
        action_from: "lookout",
        action_to: "idle",
        weight: 1.2,
        animations: ["idle_0_idle_0"]
      },
      {
        action_from: "idle",
        action_to: "fire",
        weight: 1.2,
        animations: ["pri_a15_zulus_cam5"]
      },
      {
        action_from: "fire",
        action_to: "idle",
        weight: 1.2,
        animations: ["idle_0_idle_0"]
      },
      {
        action_from: "idle",
        action_to: "fire_no_lookout",
        weight: 1.2,
        animations: ["idle_0_idle_0"]
      },
      {
        action_from: "fire_no_lookout",
        action_to: "idle",
        weight: 1.2,
        animations: ["idle_0_idle_0"]
      }
    ]
  };
}

import { vector, XR_vector } from "xray16";

import { ISmartCoverLoopholeDescriptor } from "@/mod/scripts/smart_covers/smart_covers";

export function get_animpoint_sit_high_loophole(
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
          idle: ["animpoint_sit_high_idle_1"]
        }
      },
      lookout: {
        animations: {
          idle: ["animpoint_sit_high_idle_1"]
        }
      },
      fire: {
        animations: {
          idle: ["animpoint_sit_high_idle_1"],

          shoot: ["animpoint_sit_high_idle_1"]
        }
      },
      fire_no_lookout: {
        animations: {
          idle: ["animpoint_sit_high_idle_1"],
          shoot: ["animpoint_sit_high_idle_1"]
        }
      },
      reload: {
        animations: {
          idle: ["animpoint_sit_high_idle_1"]
        }
      }
    },
    transitions: [
      {
        action_from: "idle",
        action_to: "lookout",
        weight: 1.2,
        animations: ["animpoint_sit_high_in_1"]
      },
      {
        action_from: "lookout",
        action_to: "idle",
        weight: 1.2,
        animations: ["animpoint_sit_high_in_1"]
      },
      {
        action_from: "idle",
        action_to: "fire",
        weight: 1.2,
        animations: ["animpoint_sit_high_in_1"]
      },
      {
        action_from: "fire",
        action_to: "idle",
        weight: 1.2,
        animations: ["animpoint_sit_high_in_1"]
      },
      {
        action_from: "idle",
        action_to: "fire_no_lookout",
        weight: 1.2,
        animations: ["animpoint_sit_high_in_1"]
      },
      {
        action_from: "fire_no_lookout",
        action_to: "idle",
        weight: 1.2,
        animations: ["animpoint_sit_high_in_1"]
      }
    ]
  };
}

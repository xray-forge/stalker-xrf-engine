import { vector, XR_vector } from "xray16";

import { Optional } from "@/mod/lib/types";
import { ISmartCoverLoopholeDescriptor } from "@/mod/scripts/core/smart_covers/smart_covers";

export function get_stand_back_loophole(
  id: string,
  fov_direction: XR_vector,
  position?: Optional<XR_vector>,
  enter_direction?: Optional<XR_vector>
): ISmartCoverLoopholeDescriptor {
  const pos = position || new vector().set(0, 0, 0);
  const enter_dir = enter_direction || new vector().set(-1, 0, 0);

  return {
    id: id,
    fov_position: pos,
    fov_direction: fov_direction,
    enter_direction: enter_dir,
    enterable: true,
    exitable: true,
    usable: true,
    fov: 90.0,
    range: 50.0,
    actions: {
      idle: {
        animations: {
          idle: ["loophole_stand_back_idle_0"]
        }
      },
      lookout: {
        animations: {
          idle: ["loophole_stand_back_idle_0"]
        }
      },
      fire: {
        animations: {
          idle: ["loophole_stand_back_attack_idle_0"],
          shoot: ["loophole_stand_back_attack_shoot_0", "loophole_stand_back_attack_shoot_1"]
        }
      },
      fire_no_lookout: {
        animations: {
          idle: ["loophole_stand_back_attack_idle_0"],
          shoot: ["loophole_stand_back_attack_shoot_0", "loophole_stand_back_attack_shoot_1"]
        }
      },
      reload: {
        animations: {
          idle: ["loophole_stand_back_reload_0"]
        }
      }
    },
    transitions: [
      {
        action_from: "idle",
        action_to: "lookout",
        weight: 1.2,
        animations: ["loophole_stand_back_idle_0"]
      },
      {
        action_from: "lookout",
        action_to: "idle",
        weight: 1.2,
        animations: ["loophole_stand_back_idle_0"]
      },
      {
        action_from: "idle",
        action_to: "fire",
        weight: 1.2,
        animations: ["loophole_stand_back_attack_in_0"]
      },
      {
        action_from: "fire",
        action_to: "idle",
        weight: 1.2,
        animations: ["loophole_stand_back_attack_out_0"]
      },
      {
        action_from: "idle",
        action_to: "fire_no_lookout",
        weight: 1.2,
        animations: ["loophole_stand_back_attack_in_0"]
      },
      {
        action_from: "fire_no_lookout",
        action_to: "idle",
        weight: 1.2,
        animations: ["loophole_stand_back_attack_out_0"]
      }
    ]
  };
}

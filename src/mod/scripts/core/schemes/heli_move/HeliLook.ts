import { vector, XR_CHelicopter, XR_game_object, XR_vector } from "xray16";

import { Optional } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const heli_looker: LuaTable<number, HeliLook> = new LuaTable();
const logger: LuaLogger = new LuaLogger("HeliLook");

export class HeliLook {
  public readonly object: XR_game_object;
  public look_point: XR_vector;
  public look_state: boolean;

  public constructor(object: XR_game_object) {
    this.object = object;
    this.look_point = new vector().set(0, 0, 0);
    this.look_state = false;
  }

  public calc_look_point(dest_point: Optional<XR_vector>, look_state: boolean): void {
    this.look_state = look_state;

    if (look_state && dest_point) {
      const heli: XR_CHelicopter = this.object.get_helicopter();
      const dist_to_dest_point: number = heli.GetDistanceToDestPosition();
      const curr_heli_position: XR_vector = this.object.position();
      const curr_heli_direction: XR_vector = this.object.direction();
      const heli_velocity: number = heli.GetSpeedInDestPoint(0);
      const curr_heli_velocity: number = heli.GetCurrVelocity();
      const new_direction: XR_vector = new vector().set(0, 0, 0);

      new_direction.x = (dest_point.x - curr_heli_position.x) / dist_to_dest_point;
      new_direction.y = (dest_point.y - curr_heli_position.y) / dist_to_dest_point;
      new_direction.z = (dest_point.z - curr_heli_position.z) / dist_to_dest_point;

      let delta;

      if (heli_velocity <= 0) {
        delta = 0;
      } else {
        delta = curr_heli_velocity / heli_velocity;
        if (delta > 2) {
          delta = 2;
        }
      }

      this.look_point.x = heli_velocity ^ (2 * (curr_heli_direction.x + (new_direction.x / 2) * (2 - delta)));
      this.look_point.y = heli_velocity ^ (2 * (curr_heli_direction.y + (new_direction.y / 2) * (2 - delta)));
      this.look_point.z = heli_velocity ^ (2 * (curr_heli_direction.z + (new_direction.z / 2) * (2 - delta)));

      heli.LookAtPoint(this.look_point, look_state);
    }
  }
}

export function get_heli_looker(object: XR_game_object): HeliLook {
  if (heli_looker.get(object.id()) === null) {
    heli_looker.set(object.id(), new HeliLook(object));
  }

  return heli_looker.get(object.id());
}

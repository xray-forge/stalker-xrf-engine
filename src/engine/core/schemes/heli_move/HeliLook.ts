import { CHelicopter } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { ClientObject, Optional, Vector } from "@/engine/lib/types";

const heli_looker: LuaTable<number, HeliLook> = new LuaTable();
const logger: LuaLogger = new LuaLogger($filename);

export class HeliLook {
  public readonly object: ClientObject;
  public look_point: Vector;
  public look_state: boolean;

  public constructor(object: ClientObject) {
    this.object = object;
    this.look_point = createEmptyVector();
    this.look_state = false;
  }

  public calc_look_point(dest_point: Optional<Vector>, look_state: boolean): void {
    this.look_state = look_state;

    if (look_state && dest_point) {
      const heli: CHelicopter = this.object.get_helicopter();
      const dist_to_dest_point: number = heli.GetDistanceToDestPosition();
      const curr_heli_position: Vector = this.object.position();
      const curr_heli_direction: Vector = this.object.direction();
      const heli_velocity: number = heli.GetSpeedInDestPoint(0);
      const curr_heli_velocity: number = heli.GetCurrVelocity();
      const new_direction: Vector = createEmptyVector();

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

export function get_heli_looker(object: ClientObject): HeliLook {
  if (heli_looker.get(object.id()) === null) {
    heli_looker.set(object.id(), new HeliLook(object));
  }

  return heli_looker.get(object.id());
}

import { vector, XR_CHelicopter, XR_game_object, XR_vector } from "xray16";

import { Optional } from "@/mod/lib/types";

const heli_flyer: LuaTable<number, HeliFly> = new LuaTable();

export class HeliFly {
  public object: XR_game_object;
  public point_by_look: XR_vector;
  public block_flook: boolean;
  public dist_by_look: number;
  public heliLAccFW: number;
  public heliLAccBW: number;
  public max_velocity: number;
  public dest_point: Optional<XR_vector>;
  public point_arr: LuaTable<number, XR_vector>;

  public constructor(object: XR_game_object) {
    this.object = object;
    this.block_flook = false;
    this.dist_by_look = 0;
    this.heliLAccFW = 6;
    this.heliLAccBW = 4;
    this.max_velocity = 0;
    this.point_arr = new LuaTable();
    this.dest_point = null;
    this.point_by_look = new vector().set(0, 0, 0);
  }

  public fly_on_point_with_vector(
    dest_point: XR_vector,
    dest_direction: XR_vector,
    dest_velocity: number,
    flag_to_wp_callback: boolean,
    flag_by_null_velocity: boolean
  ): boolean {
    const heli: XR_CHelicopter = this.object.get_helicopter();
    const curr_heli_position: XR_vector = this.object.position();
    const curr_heli_direction: XR_vector = this.object.direction();
    const curr_heli_velocity: number = heli.GetCurrVelocity();

    dest_velocity = (dest_velocity * 1000) / 3600;
    if (!flag_to_wp_callback) {
      let time_by_fly: number = 0;
      let rez_point: XR_vector = new vector().set(0, 0, 0);
      let a_speed = 0;
      let d_path: number;

      if (dest_velocity >= curr_heli_velocity) {
        a_speed = this.heliLAccFW;
        d_path = (curr_heli_velocity * 2) / a_speed;
      } else {
        a_speed = -this.heliLAccBW;
        d_path = (-curr_heli_velocity * 2) / a_speed;
      }

      time_by_fly = (dest_velocity - curr_heli_velocity) / a_speed; // -- t=(v2-v1)/a

      const delta = curr_heli_velocity * time_by_fly + (a_speed * time_by_fly * time_by_fly) / 2;

      if (delta >= d_path) {
        this.point_arr.set(0, curr_heli_position);
        this.point_arr.set(1, dest_point);
        this.point_arr.set(2, curr_heli_direction);

        rez_point = this.calc_point();
        if (!this.block_flook) {
          rez_point.x = rez_point.x + (curr_heli_direction.x * delta) / 2;
          rez_point.z = rez_point.z + (curr_heli_direction.z * delta) / 2;
        }

        flag_to_wp_callback = true;
      } else {
        rez_point = dest_point;
        flag_to_wp_callback = false;
      }

      this.dest_point = rez_point;
      // ------------------------------------------------
    } else {
      this.dest_point = dest_point;
      flag_to_wp_callback = false;
    }

    heli.SetDestPosition(this.dest_point);
    this.correct_velocity();
    if (flag_by_null_velocity) {
      heli.SetSpeedInDestPoint(0);
    } else {
      heli.SetSpeedInDestPoint(heli.GetMaxVelocity());
    }

    return flag_to_wp_callback;
  }

  public get_block_flook(): boolean {
    return this.block_flook;
  }

  public calc_point(): XR_vector {
    const rez_point = new vector().set(0, 0, 0);
    const xxArr: LuaTable<number, number> = new LuaTable();

    xxArr.set(0, this.point_arr.get(0).x);
    xxArr.set(1, this.point_arr.get(1).x);
    xxArr.set(2, this.point_arr.get(2).x);

    const yyArr: LuaTable<number, number> = new LuaTable();

    yyArr.set(0, this.point_arr.get(0).y);
    yyArr.set(1, this.point_arr.get(1).y);
    yyArr.set(2, this.point_arr.get(2).y);

    const zzArr: LuaTable<number, number> = new LuaTable();

    zzArr.set(0, this.point_arr.get(0).z);
    zzArr.set(1, this.point_arr.get(1).z);
    zzArr.set(2, this.point_arr.get(2).z);

    rez_point.y = (this.point_arr.get(0).y + this.point_arr.get(1).y) / 2;

    if (rez_point.y == this.point_arr.get(0).y) {
      rez_point.z = (this.point_arr.get(0).z + this.point_arr.get(1).z) / 2;
      if (rez_point.z == this.point_arr.get(0).z) {
        rez_point.x = (this.point_arr.get(0).x + this.point_arr.get(1).x) / 2;
        rez_point.z = this.lagrange(rez_point.x, xxArr, zzArr);
      } else {
        rez_point.x = this.lagrange(rez_point.z, zzArr, xxArr);
      }
    } else {
      rez_point.x = this.lagrange(rez_point.y, yyArr, xxArr);
      rez_point.z = this.lagrange(rez_point.y, yyArr, zzArr);
    }

    // --'    printf("fly_point[x=%d; y=%d; z=%d;]",rez_point.x, rez_point.y, rez_point.z);

    return rez_point;
  }

  public lagrange(x: number, xArr: LuaTable<number, number>, yArr: LuaTable<number, number>): number {
    let i;
    let j;
    let m;
    let s = 0;

    for (const i of $range(0, 2)) {
      m = yArr.get(i);
      for (const j of $range(0, 2)) {
        if (j !== i) {
          m = (m * (x - xArr.get(j))) / (xArr.get(i) - xArr.get(j));
        }
      }

      s = s + m;
    }

    return s;
  }

  public correct_velocity(): void {
    const heli = this.object.get_helicopter();
    const curr_heli_velocity = heli.GetCurrVelocity();
    const dist_to_dest_point = heli.GetDistanceToDestPosition();
    const a_speed = this.heliLAccFW;
    let dest_velocity = ((2 * a_speed * dist_to_dest_point + curr_heli_velocity) ** 2 / 3) ^ (1 / 2);

    if ((this.max_velocity * 1000) / 3600 < dest_velocity) {
      dest_velocity = (this.max_velocity * 1000) / 3600;
    }

    heli.SetMaxVelocity(dest_velocity);
    // --'  printf("dist_to_dest_point %s", dist_to_dest_point);
    // --'    printf("dest_velocity } = %d", dest_velocity);
  }

  public look_at_position(): void {
    if (this.block_flook) {
      const heli: XR_CHelicopter = this.object.get_helicopter();

      heli.LookAtPoint(this.point_by_look, true);
    }
  }

  public set_block_flook(fl_block: boolean): void {
    this.block_flook = fl_block;
  }

  public set_look_point(l_point: XR_vector): void {
    this.point_by_look = l_point;
  }
}

export function get_heli_flyer(object: XR_game_object): HeliFly {
  if (heli_flyer.get(object.id()) === null) {
    heli_flyer.set(object.id(), new HeliFly(object));
  }

  return heli_flyer.get(object.id());
}

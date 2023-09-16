import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { IPatrolSuggestedState } from "@/engine/core/objects/animation/types";
import type {
  LuaArray,
  Optional,
  TCount,
  TDistance,
  TDuration,
  TIndex,
  TName,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

/**
 * todo;
 */
export interface ICampPoint {
  key: number;
  pos: Vector;
}

/**
 * todo;
 */
export interface ISchemeCamperState extends IBaseSchemeState {
  path_walk: TName;
  path_look: TName;
  shoot: TName;
  sniper_aim: string;
  sniper_anim: string;
  radius: TDistance;
  sniper: boolean;
  no_retreat: boolean;
  scantime_free: TDuration;
  attack_sound: Optional<TName>;
  idle: TDuration;
  post_enemy_wait: TDuration;
  enemy_disp: number;
  scandelta: TCount;
  timedelta: TCount;
  time_scan_delta: TCount;
  suggested_state: IPatrolSuggestedState;
  scan_table: LuaTable<any, LuaArray<ICampPoint>>;
  cur_look_point: Optional<TIndex>;
  last_look_point: Optional<ICampPoint>;
  scan_begin: Optional<TTimestamp>;
  mem_enemy: Optional<TTimestamp>;
  wp_flag: Optional<number>;
}

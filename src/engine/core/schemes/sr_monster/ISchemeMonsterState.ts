import type { IBaseSchemeState } from "@/engine/core/objects/ai/scheme";
import type { LuaArray, Optional, Patrol, TDuration, TName, TRate } from "@/engine/lib/types";

/**
 * todo
 */
export interface ISchemeMonsterState extends IBaseSchemeState {
  snd_obj: Optional<string>;
  delay: TDuration;
  idle: TDuration;
  path: Patrol;
  path_table: LuaArray<TName>;
  monster: Optional<string>;
  sound_slide_vel: TRate;
}

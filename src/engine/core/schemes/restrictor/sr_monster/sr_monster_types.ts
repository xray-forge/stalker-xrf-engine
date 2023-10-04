import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { LuaArray, Optional, Patrol, TDuration, TName, TRate, TTimestamp } from "@/engine/lib/types";

/**
 * todo
 */
export interface ISchemeMonsterState extends IBaseSchemeState {
  soundObject: Optional<string>;
  delay: TDuration;
  idle: TDuration;
  idleEnd: TTimestamp;
  path: Patrol;
  pathTable: LuaArray<TName>;
  monster: Optional<string>;
  soundSlideVel: TRate;
}

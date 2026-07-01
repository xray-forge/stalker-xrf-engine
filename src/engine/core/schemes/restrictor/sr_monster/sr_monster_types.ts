import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { LuaArray, Nillable, Patrol, TDuration, TName, TRate, TTimestamp } from "@/engine/lib/types";

/**
 * State of the monster scheme.
 */
export interface ISchemeMonsterState extends IBaseSchemeState {
  soundObject: Nillable<string>;
  delay: TDuration;
  idle: TDuration;
  idleEnd: TTimestamp;
  path: Patrol;
  pathTable: LuaArray<TName>;
  monster: Nillable<string>;
  soundSlideVel: TRate;
}

import type { Patrol } from "xray16/alias";
import type { LuaArray, Nillable, TDuration, TName, TRate, TTimestamp } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/database/database_types";

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

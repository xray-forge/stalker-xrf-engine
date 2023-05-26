import { patrol } from "xray16";

import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { LuaArray, Optional, TDuration, TName, TRate } from "@/engine/lib/types";

/**
 * todo
 */
export interface ISchemeMonsterState extends IBaseSchemeState {
  snd_obj: Optional<string>;
  delay: TDuration;
  idle: TDuration;
  path: patrol;
  path_table: LuaArray<TName>;
  monster: Optional<string>;
  sound_slide_vel: TRate;
}

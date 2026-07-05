import type { Nillable } from "xray16/lib";

import type { IBaseSchemeLogic, IBaseSchemeState } from "@/engine/core/database/database_types";
import type { EMonsterState } from "@/engine/lib/constants/monsters";

/**
 * State of remark scheme.
 */
export interface ISchemeMobRemarkState extends IBaseSchemeState {
  state: Nillable<EMonsterState>;
  dialogCondition: Nillable<IBaseSchemeLogic>;
  noReset: boolean;
  anim: string;
  animationMovement: boolean;
  animationHead: Nillable<string>;
  tip: Nillable<string>;
  snd: Nillable<string>;
  time: Nillable<string>;
}

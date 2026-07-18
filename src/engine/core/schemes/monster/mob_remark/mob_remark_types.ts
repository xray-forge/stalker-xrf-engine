import type { Nillable } from "xray16/lib";

import type { IBaseSchemeLogic, IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EMonsterState } from "@/engine/lib/constants/monsters";
import type { EScheme } from "@/engine/lib/types";

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

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.MOB_REMARK]: ISchemeMobRemarkState;
  }
}

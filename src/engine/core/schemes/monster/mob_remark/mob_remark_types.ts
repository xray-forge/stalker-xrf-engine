import type { IBaseSchemeLogic, IBaseSchemeState } from "@/engine/core/database/database_types";
import type { EMonsterState } from "@/engine/lib/constants/monsters";
import type { Optional } from "@/engine/lib/types";

/**
 * State of remark scheme.
 */
export interface ISchemeMobRemarkState extends IBaseSchemeState {
  state: Optional<EMonsterState>;
  dialogCondition: Optional<IBaseSchemeLogic>;
  noReset: boolean;
  anim: string;
  animationMovement: boolean;
  animationHead: Optional<string>;
  tip: Optional<string>;
  snd: Optional<string>;
  time: Optional<string>;
}

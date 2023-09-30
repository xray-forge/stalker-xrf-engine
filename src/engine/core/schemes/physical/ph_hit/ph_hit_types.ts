import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { TName, TRate } from "@/engine/lib/types";

/**
 * State describing physical hit scheme.
 */
export interface ISchemePhysicalHitState extends IBaseSchemeState {
  power: TRate;
  impulse: TRate;
  bone: TName;
  dirPath: TName;
}

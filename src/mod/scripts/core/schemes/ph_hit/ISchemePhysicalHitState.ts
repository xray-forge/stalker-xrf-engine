import { TRate } from "@/mod/lib/types";
import { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";

/**
 * todo;
 */
export interface ISchemePhysicalHitState extends IBaseSchemeState {
  power: TRate;
  impulse: TRate;
  bone: string;
  dir_path: string;
}

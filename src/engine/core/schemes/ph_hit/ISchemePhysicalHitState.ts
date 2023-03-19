import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { TRate } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePhysicalHitState extends IBaseSchemeState {
  power: TRate;
  impulse: TRate;
  bone: string;
  dir_path: string;
}

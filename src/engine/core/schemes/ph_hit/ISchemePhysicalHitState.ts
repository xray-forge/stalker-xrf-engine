import { IBaseSchemeState } from "@/engine/core/objects/ai/scheme";
import { TRate } from "@/engine/lib/types";

/**
 * State describing physical hit scheme.
 */
export interface ISchemePhysicalHitState extends IBaseSchemeState {
  power: TRate;
  impulse: TRate;
  bone: string;
  dir_path: string;
}

import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { TConditionList } from "@/engine/core/utils/parse";
import { TDistance } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeCoverState extends IBaseSchemeState {
  smart: string;
  anim: TConditionList;
  sound_idle: string;
  use_attack_direction: boolean;
  radius_min: TDistance;
  radius_max: TDistance;
}

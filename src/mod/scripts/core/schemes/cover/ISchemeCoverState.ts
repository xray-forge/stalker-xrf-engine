import { TDistance } from "@/mod/lib/types";
import { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";
import { TConditionList } from "@/mod/scripts/utils/parse";

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

import { Optional, TName } from "@/engine/lib/types";
import { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";
import { TConditionList } from "@/engine/scripts/utils/parse";

/**
 * todo;
 */
export interface ISchemeMobRemarkState extends IBaseSchemeState {
  state: Optional<string>;
  dialog_cond: Optional<{ name: TName; condlist: TConditionList }>;
  no_reset: boolean;
  anim: string;
  anim_movement: boolean;
  anim_head: Optional<string>;
  tip: Optional<string>;
  snd: Optional<string>;
  time: Optional<string>;
}

/**
 * state.state = getMobState(ini, section, object);
 */

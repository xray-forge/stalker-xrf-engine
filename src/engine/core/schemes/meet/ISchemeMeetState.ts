import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { MeetManager } from "@/engine/core/schemes/meet/MeetManager";
import type { TConditionList } from "@/engine/core/utils/ini/types";
import type { Optional, TDistance, TSection } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeMeetState extends IBaseSchemeState {
  meetManager: MeetManager;
  snd_on_use: TConditionList;
  use: TConditionList;
  meet_dialog: TConditionList;
  abuse: TConditionList;
  trade_enable: TConditionList;
  allow_break: TConditionList;
  meet_on_talking: TConditionList;
  use_text: TConditionList;
  close_distance: TConditionList;
  close_anim: TConditionList;
  close_snd_distance: TConditionList;
  close_snd_hello: TConditionList;
  close_snd_bye: TConditionList;
  close_victim: TConditionList;
  far_distance: TConditionList;
  far_anim: TConditionList;
  far_snd_distance: TConditionList;
  far_snd: TConditionList;
  far_victim: TConditionList;
  meet_section: Optional<TSection>;
  reset_distance: TDistance;
  meet_only_at_path: boolean;
}

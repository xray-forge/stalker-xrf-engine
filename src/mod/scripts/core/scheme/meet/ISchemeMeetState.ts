import type { Optional, TDistance, TSection } from "@/mod/lib/types";
import type { IBaseSchemeState } from "@/mod/scripts/core/scheme/base";
import type { MeetManager } from "@/mod/scripts/core/scheme/meet/MeetManager";
import type { TConditionList } from "@/mod/scripts/utils/parse";

/**
 * todo;
 */
export interface ISchemeMeetState extends IBaseSchemeState {
  meet_manager: MeetManager;
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
  meet_set: boolean;
  meet_section: Optional<TSection>;
  reset_distance: TDistance;
  meet_only_at_path: boolean;
}

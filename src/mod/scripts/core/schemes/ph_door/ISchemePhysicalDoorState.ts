import type { LuaArray, Optional, TDistance, TLabel, TName } from "@/mod/lib/types";
import type { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";
import type { IConfigSwitchCondition, TConditionList } from "@/mod/scripts/utils/parse";

/**
 * todo;
 */
export interface ISchemePhysicalDoorState extends IBaseSchemeState {
  closed: boolean;
  locked: boolean;
  no_force: boolean;
  not_for_npc: boolean;
  show_tips: boolean;
  tip_open: TLabel;
  tip_unlock: TLabel;
  tip_close: TLabel;
  slider: boolean;
  snd_open_start: string;
  snd_close_start: string;
  snd_close_stop: string;
  script_used_more_than_once: Optional<boolean>;
  on_use: Optional<{ name: TName; condlist: LuaArray<IConfigSwitchCondition> }>;
  hit_on_bone: LuaArray<{
    dist: Optional<TDistance>;
    state: Optional<TConditionList>;
  }>;
}

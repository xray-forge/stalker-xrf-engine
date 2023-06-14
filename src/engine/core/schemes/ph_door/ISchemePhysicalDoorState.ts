import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { IConfigSwitchCondition, TConditionList } from "@/engine/core/utils/ini/parse";
import type { LuaArray, Optional, TDistance, TLabel, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePhysicalDoorState extends IBaseSchemeState {
  closed: boolean;
  locked: boolean;
  no_force: boolean;
  not_for_npc: boolean;
  show_tips: boolean;
  tip_open: Optional<TLabel>;
  tip_unlock: TLabel;
  tip_close: TLabel;
  slider: boolean;
  snd_open_start: Optional<string>;
  snd_close_start: Optional<string>;
  snd_close_stop: string;
  script_used_more_than_once: Optional<boolean>;
  on_use: Optional<{ name: TName; condlist: LuaArray<IConfigSwitchCondition> }>;
  hit_on_bone: LuaArray<{
    dist: Optional<TDistance>;
    state: Optional<TConditionList>;
  }>;
}

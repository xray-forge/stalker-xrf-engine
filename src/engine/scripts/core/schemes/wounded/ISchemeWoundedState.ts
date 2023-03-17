import type { LuaArray, Optional, TNumberId } from "@/engine/lib/types";
import type { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";
import type { WoundManager } from "@/engine/scripts/core/schemes/wounded/WoundManager";

/**
 * todo;
 */
export interface ISchemeWoundedState extends IBaseSchemeState {
  wound_manager: WoundManager;
  wounded_set: boolean;
  wounded_section: string;
  hp_state: LuaArray<any>;
  hp_state_see: LuaArray<any>;
  psy_state: LuaArray<any>;
  hp_victim: LuaArray<any>;
  hp_cover: LuaArray<any>;
  hp_fight: LuaArray<any>;
  syndata: LuaArray<any>;
  help_start_dialog: Optional<string>;
  use_medkit: Optional<boolean>;
  help_dialog: TNumberId;
  not_for_help: Optional<boolean>;
  autoheal: boolean;
  enable_talk: boolean;
}

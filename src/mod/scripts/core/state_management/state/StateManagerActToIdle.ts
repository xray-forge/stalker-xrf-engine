import { action_base, game_object, XR_action_base } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { sendToNearestAccessibleVertex } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("StateManagerActToIdle", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

export interface IStateManagerActToIdle extends XR_action_base {
  st: StateManager;
}

export const StateManagerActToIdle: IStateManagerActToIdle = declare_xr_class("StateManagerActToIdle", action_base, {
  __init(name: string, st: StateManager): void {
    action_base.__init(this, null, name);

    this.st = st;
  },
  initialize(): void {
    action_base.initialize(this);
    // --'    this.object:movement_enabled(true)

    this.object.inactualize_patrol_path();

    if (this.object.best_enemy() !== null) {
      this.st.set_state("idle", null, null, null, { fast_set: true });

      return;
    }

    if (this.object.best_danger() !== null) {
      this.st.set_state("idle", null, null, null, { fast_set: true });

      return;
    }

    this.st.set_state("idle", null, null, null, null);

    sendToNearestAccessibleVertex(this.object, this.object.level_vertex_id());

    this.object.set_path_type(game_object.level_path);
  },
  finalize(): void {
    this.st.current_object = -1;
    action_base.finalize(this);
  },
  execute(): void {
    sendToNearestAccessibleVertex(this.object, this.object.level_vertex_id());
    this.object.set_path_type(game_object.level_path);

    if (this.object.best_enemy()) {
      this.st.set_state("idle", null, null, null, { fast_set: true });
      action_base.execute(this);

      return;
    }

    if (this.object.best_danger()) {
      this.st.set_state("idle", null, null, null, { fast_set: true });
      action_base.execute(this);

      return;
    }

    this.st.set_state("idle", null, null, null, null);
    action_base.execute(this);
  },
} as IStateManagerActToIdle);

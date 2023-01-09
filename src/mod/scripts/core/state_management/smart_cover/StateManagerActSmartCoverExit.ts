import { action_base, level, vector, XR_action_base, XR_vector } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger(
  "StateManagerActSmartCoverExit",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerActSmartCoverExit extends XR_action_base {
  st: StateManager;
}

export const StateManagerActSmartCoverExit: IStateManagerActSmartCoverExit = declare_xr_class(
  "StateManagerActSmartCoverExit",
  action_base,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);

      const object = this.object;

      object.set_smart_cover_target();
      object.use_smart_covers_only(false);
      object.set_smart_cover_target_selector();

      let vertex: number = object.level_vertex_id();
      let npc_position: XR_vector = level.vertex_position(vertex);

      if (!object.accessible(npc_position)) {
        const ttp = new vector().set(0, 0, 0);

        vertex = object.accessible_nearest(npc_position, ttp);
        npc_position = level.vertex_position(vertex);
        // printf("accesible position is %s", vectorToString(npc_position));
      }

      object.set_dest_level_vertex_id(vertex);
      // printf("accesible position2 is %s", vectorToString(level.vertex_position(vertex)))
    },
    execute(): void {
      log.info("Act smart cover exit");
      action_base.execute(this);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActSmartCoverExit
);

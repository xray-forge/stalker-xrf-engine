import { action_base, level, vector, XR_vector } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActSmartCoverExit",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActSmartCoverExit extends action_base {
  private readonly stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerActSmartCoverExit.__name);
    this.stateManager = stateManager;
  }

  public override initialize(): void {
    super.initialize();

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
    }

    object.set_dest_level_vertex_id(vertex);
  }

  public override execute(): void {
    super.execute();
  }

  public override finalize(): void {
    super.finalize();
  }
}

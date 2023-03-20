import { action_base, level, LuabindClass, vector, XR_vector } from "xray16";

import { StateManager } from "@/engine/core/objects/state/StateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { TNumberId } from "@/engine/lib/types";

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

  /**
   * todo: Description.
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerActSmartCoverExit.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    const object = this.object;

    object.set_smart_cover_target();
    object.use_smart_covers_only(false);
    object.set_smart_cover_target_selector();

    let vertexId: TNumberId = object.level_vertex_id();
    const npcPosition: XR_vector = level.vertex_position(vertexId);

    if (!object.accessible(npcPosition)) {
      vertexId = object.accessible_nearest(npcPosition, new vector().set(0, 0, 0));
    }

    object.set_dest_level_vertex_id(vertexId);
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    super.finalize();
  }
}

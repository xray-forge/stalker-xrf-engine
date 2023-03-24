import { action_base, level, LuabindClass, vector, XR_game_object, XR_vector } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionSmartCoverExit extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionSmartCoverExit.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    const object: XR_game_object = this.object;

    object.set_smart_cover_target();
    object.use_smart_covers_only(false);
    object.set_smart_cover_target_selector();

    const vertexId: TNumberId = object.level_vertex_id();
    const vertexPosition: XR_vector = level.vertex_position(vertexId);

    if (object.accessible(vertexPosition)) {
      object.set_dest_level_vertex_id(vertexId);
    } else {
      object.set_dest_level_vertex_id(object.accessible_nearest(vertexPosition, new vector().set(0, 0, 0)));
    }
  }
}

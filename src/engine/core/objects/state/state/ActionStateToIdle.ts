import { action_base, game_object, LuabindClass } from "xray16";

import { EStalkerState } from "@/engine/core/objects/state";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { sendToNearestAccessibleVertex } from "@/engine/core/utils/object";
import { TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionStateToIdle extends action_base {
  private readonly stateManager: StalkerStateManager;

  /**
   * todo: Description.
   */
  public constructor(stateManager: StalkerStateManager, name?: TName) {
    super(null, name || ActionStateToIdle.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.object.inactualize_patrol_path();

    if (this.object.best_enemy() !== null) {
      this.stateManager.setState(EStalkerState.IDLE, null, null, null, { isForced: true });

      return;
    }

    if (this.object.best_danger() !== null) {
      this.stateManager.setState(EStalkerState.IDLE, null, null, null, { isForced: true });

      return;
    }

    this.stateManager.setState(EStalkerState.IDLE, null, null, null, null);

    sendToNearestAccessibleVertex(this.object, this.object.level_vertex_id());

    this.object.set_path_type(game_object.level_path);
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    sendToNearestAccessibleVertex(this.object, this.object.level_vertex_id());
    this.object.set_path_type(game_object.level_path);

    if (this.object.best_enemy()) {
      this.stateManager.setState(EStalkerState.IDLE, null, null, null, { isForced: true });
      super.execute();
    } else if (this.object.best_danger()) {
      this.stateManager.setState(EStalkerState.IDLE, null, null, null, { isForced: true });
      super.execute();
    } else {
      this.stateManager.setState(EStalkerState.IDLE, null, null, null, null);
      super.execute();
    }
  }
}

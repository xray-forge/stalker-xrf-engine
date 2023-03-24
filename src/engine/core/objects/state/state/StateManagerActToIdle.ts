import { action_base, game_object, LuabindClass } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { sendToNearestAccessibleVertex } from "@/engine/core/utils/object";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActToIdle extends action_base {
  public readonly stateManager: StalkerStateManager;

  /**
   * todo: Description.
   */
  public constructor(stateManager: StalkerStateManager, name?: TName) {
    super(null, name || StateManagerActToIdle.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.object.inactualize_patrol_path();

    if (this.object.best_enemy() !== null) {
      this.stateManager.set_state("idle", null, null, null, { fast_set: true });

      return;
    }

    if (this.object.best_danger() !== null) {
      this.stateManager.set_state("idle", null, null, null, { fast_set: true });

      return;
    }

    this.stateManager.set_state("idle", null, null, null, null);

    sendToNearestAccessibleVertex(this.object, this.object.level_vertex_id());

    this.object.set_path_type(game_object.level_path);
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    this.stateManager.current_object = -1;
    super.finalize();
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    sendToNearestAccessibleVertex(this.object, this.object.level_vertex_id());
    this.object.set_path_type(game_object.level_path);

    if (this.object.best_enemy()) {
      this.stateManager.set_state("idle", null, null, null, { fast_set: true });
      super.execute();

      return;
    }

    if (this.object.best_danger()) {
      this.stateManager.set_state("idle", null, null, null, { fast_set: true });
      super.execute();

      return;
    }

    this.stateManager.set_state("idle", null, null, null, null);
    super.execute();
  }
}

import { action_base, LuabindClass } from "xray16";

import { EStalkerState } from "@/engine/core/objects/animation";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { sendToNearestAccessibleVertex } from "@/engine/core/utils/object/object_location";
import { EClientObjectPath, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionStateToIdle extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager, name?: TName) {
    super(null, name || ActionStateToIdle.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    logger.info("State to idle for:", this.object.name());

    super.initialize();

    this.object.inactualize_patrol_path();
    this.object.set_path_type(EClientObjectPath.LEVEL_PATH);

    sendToNearestAccessibleVertex(this.object, this.object.level_vertex_id());
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    if (this.stateManager.targetState !== EStalkerState.IDLE) {
      this.object.clear_animations();
      this.stateManager.setState(EStalkerState.IDLE, null, null, null, { isForced: true });
      this.stateManager.animation.setState(null, true);
      this.stateManager.animation.setControl();
    }
  }
}

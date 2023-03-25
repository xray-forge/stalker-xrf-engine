import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Whether have no weapon in hands at all.
 */
@LuabindClass()
export class EvaluatorWeaponNoneNow extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorWeaponNoneNow.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if object has no active weapon.
   */
  public override evaluate(): boolean {
    return this.object.active_item() === null;
  }
}

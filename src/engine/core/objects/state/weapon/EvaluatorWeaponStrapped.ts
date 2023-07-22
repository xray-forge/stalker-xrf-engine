import { LuabindClass, property_evaluator } from "xray16";

import { states } from "@/engine/core/objects/animation/states";
import { EWeaponAnimation } from "@/engine/core/objects/state";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Whether weapon should be strapped.
 */
@LuabindClass()
export class EvaluatorWeaponStrapped extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorWeaponStrapped.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if target weapon state in animation is 'strapped'.
   */
  public override evaluate(): boolean {
    return states.get(this.stateManager.targetState).weapon === EWeaponAnimation.STRAPPED;
  }
}

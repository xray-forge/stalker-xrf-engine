import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EWeaponAnimation } from "@/engine/core/objects/animation";
import { states } from "@/engine/core/objects/animation/states";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Whether weapon should be strapped.
 */
@LuabindClass()
export class EvaluatorWeaponStrappedTarget extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorWeaponStrappedTarget.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if target weapon state in animation is 'strapped'.
   */
  public override evaluate(): boolean {
    return states.get(this.stateManager.targetState).weapon === EWeaponAnimation.STRAPPED;
  }
}

import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EWeaponAnimation } from "@/engine/core/objects/animation/animation_types";
import { states } from "@/engine/core/objects/animation/states";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Whether object should drop weapon.
 */
@LuabindClass()
export class EvaluatorWeaponDrop extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorWeaponDrop.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check whether target state requires weapon drop.
   */
  public override evaluate(): boolean {
    return states.get(this.stateManager.targetState).weapon === EWeaponAnimation.DROP;
  }
}

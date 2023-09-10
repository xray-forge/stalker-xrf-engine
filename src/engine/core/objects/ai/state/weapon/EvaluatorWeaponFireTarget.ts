import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { states } from "@/engine/core/objects/animation/states";
import { EWeaponAnimation } from "@/engine/core/objects/animation/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Whether object is in fire weapon state.
 */
@LuabindClass()
export class EvaluatorWeaponFireTarget extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorWeaponFireTarget.__name);
    this.stateManager = stateManager;
  }

  /**
   * Evaluate whether weapon fire state is active.
   */
  public override evaluate(): boolean {
    const weaponAnimation: Optional<EWeaponAnimation> = states.get(this.stateManager.targetState).weapon;

    return weaponAnimation === EWeaponAnimation.FIRE || weaponAnimation === EWeaponAnimation.SNIPER_FIRE;
  }
}

import { LuabindClass, property_evaluator } from "xray16";

import { states } from "@/engine/core/objects/state/lib/state_lib";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { EWeaponAnimationType } from "@/engine/core/objects/state/types";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
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
    return states.get(this.stateManager.target_state).weapon === EWeaponAnimationType.DROP;
  }
}

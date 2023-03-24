import { action_base, LuabindClass } from "xray16";

import { setStalkerState } from "@/engine/core/objects/state/StalkerStateManager";
import { ISchemeCombatState } from "@/engine/core/schemes/combat";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionShoot extends action_base {
  public readonly state: ISchemeCombatState;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemeCombatState) {
    super(null, ActionShoot.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();
    setStalkerState(
      this.object,
      "hide_fire",
      null,
      null,
      { look_object: this.object.best_enemy(), look_position: null },
      null
    );
    this.state.camper_combat_action = true;
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    super.finalize();
    this.state.camper_combat_action = false;
  }
}

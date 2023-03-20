import { action_base, LuabindClass } from "xray16";

import { set_state } from "@/engine/core/objects/state/StateManager";
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
    set_state(
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

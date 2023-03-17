import { action_base, LuabindClass } from "xray16";

import { set_state } from "@/engine/scripts/core/objects/state/StateManager";
import { ISchemeCombatState } from "@/engine/scripts/core/schemes/combat";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionShoot extends action_base {
  public readonly state: ISchemeCombatState;

  /**
   * todo;
   */
  public constructor(state: ISchemeCombatState) {
    super(null, ActionShoot.__name);
    this.state = state;
  }

  /**
   * todo;
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
   * todo;
   */
  public override finalize(): void {
    super.finalize();
    this.state.camper_combat_action = false;
  }
}

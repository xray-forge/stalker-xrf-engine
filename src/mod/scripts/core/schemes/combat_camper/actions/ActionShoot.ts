import { action_base } from "xray16";

import { ISchemeCombatState } from "@/mod/scripts/core/schemes/combat";
import { set_state } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionShoot");

/**
 * todo;
 */
@LuabindClass()
export class ActionShoot extends action_base {
  public readonly state: ISchemeCombatState;

  public constructor(state: ISchemeCombatState) {
    super(null, ActionShoot.__name);
    this.state = state;
  }

  public override initialize(): void {
    super.initialize();
    set_state(this.object, "hide_fire", null, null, { look_object: this.object.best_enemy() }, null);
    this.state.camper_combat_action = true;
  }

  public override finalize(): void {
    super.finalize();
    this.state.camper_combat_action = false;
  }
}

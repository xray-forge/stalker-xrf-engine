import { action_base, LuabindClass } from "xray16";

import { setStalkerState } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/state";
import { ISchemeCombatState } from "@/engine/core/schemes/combat";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

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

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();
    setStalkerState(
      this.object,
      EStalkerState.HIDE_FIRE,
      null,
      null,
      { look_object: this.object.best_enemy(), look_position: null },
      null
    );
    this.state.isCamperCombatAction = true;
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    super.finalize();
    this.state.isCamperCombatAction = false;
  }
}

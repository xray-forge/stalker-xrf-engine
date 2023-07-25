import { action_base, LuabindClass } from "xray16";

import { setStalkerState } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/animation";
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

  public override initialize(): void {
    super.initialize();

    logger.info("Start camper shooting:", this.object.name());

    setStalkerState(this.object, EStalkerState.HIDE_FIRE, null, null, {
      lookObject: this.object.best_enemy(),
      lookPosition: null,
    });
    this.state.isCamperCombatAction = true;
  }

  public override finalize(): void {
    logger.info("Stop camper shooting:", this.object.name());

    super.finalize();
    this.state.isCamperCombatAction = false;
  }
}

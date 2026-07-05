import { action_base, LuabindClass } from "xray16";
import { TNumberId } from "xray16/lib";
import { $filename } from "xray16/macros";

import { EStalkerState } from "@/engine/core/animation/types";
import { setStalkerState } from "@/engine/core/database";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme implementing shooting action for camper combat scheme.
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

    logger.info("Start camper shooting: %s", this.object.name());

    setStalkerState(this.object, EStalkerState.HIDE_FIRE, null, null, {
      lookObjectId: this.object.best_enemy()?.id() as TNumberId,
      lookPosition: null,
    });
    this.state.isCamperCombatAction = true;
  }

  public override finalize(): void {
    logger.info("Stop camper shooting: %s", this.object.name());

    super.finalize();
    this.state.isCamperCombatAction = false;
  }
}

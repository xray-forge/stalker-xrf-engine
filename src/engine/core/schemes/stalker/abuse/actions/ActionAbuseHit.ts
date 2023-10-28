import { action_base, LuabindClass } from "xray16";

import { EStalkerState } from "@/engine/core/animation/types";
import { setStalkerState } from "@/engine/core/database";
import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse/abuse_types";
import { ACTOR_ID } from "@/engine/lib/constants/ids";

/**
 * React to object abuse.
 */
@LuabindClass()
export class ActionAbuseHit extends action_base {
  public readonly state: ISchemeAbuseState;

  public constructor(state: ISchemeAbuseState) {
    super(null, ActionAbuseHit.__name);
    this.state = state;
  }

  /**
   * Perform directional hit if object is abused.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    setStalkerState(this.object, EStalkerState.PUNCH, null, null, { lookObjectId: ACTOR_ID }, { animation: true });
  }
}

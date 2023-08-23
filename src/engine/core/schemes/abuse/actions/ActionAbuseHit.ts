import { action_base, LuabindClass } from "xray16";

import { setStalkerState } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/animation";
import { ISchemeAbuseState } from "@/engine/core/schemes/abuse/ISchemeAbuseState";
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

    setStalkerState(
      this.object,
      EStalkerState.PUNCH,
      null,
      null,
      { lookObjectId: ACTOR_ID, lookPosition: null },
      { animation: true }
    );
  }
}

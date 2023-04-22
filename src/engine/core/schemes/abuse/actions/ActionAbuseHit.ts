import { action_base, LuabindClass } from "xray16";

import { registry, setStalkerState } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/state";
import { ISchemeAbuseState } from "@/engine/core/schemes/abuse/ISchemeAbuseState";

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
      { look_object: registry.actor, look_position: null },
      { animation: true }
    );
  }
}

import { action_base, LuabindClass } from "xray16";

import { registry } from "@/engine/core/database";
import { ISchemeAbuseState } from "@/engine/core/schemes/abuse/ISchemeAbuseState";

/**
 * todo
 */
@LuabindClass()
export class ActionAbuseHit extends action_base {
  public readonly state: ISchemeAbuseState;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemeAbuseState) {
    super(null, ActionAbuseHit.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { setStalkerState } = require("@/engine/core/objects/state/StalkerStateManager");

    setStalkerState(this.object, "punch", null, null, { look_object: registry.actor }, { animation: true });
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();
  }
}

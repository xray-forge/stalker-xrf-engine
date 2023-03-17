import { action_base, LuabindClass } from "xray16";

import { registry } from "@/engine/scripts/core/database";
import { set_state } from "@/engine/scripts/core/objects/state/StateManager";
import { ISchemeAbuseState } from "@/engine/scripts/core/schemes/abuse/ISchemeAbuseState";

/**
 * todo
 */
@LuabindClass()
export class ActionAbuseHit extends action_base {
  public readonly state: ISchemeAbuseState;

  /**
   * todo;
   */
  public constructor(state: ISchemeAbuseState) {
    super(null, ActionAbuseHit.__name);
    this.state = state;
  }

  /**
   * todo;
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { set_state } = require("@/engine/scripts/core/objects/state/StateManager");

    set_state(this.object, "punch", null, null, { look_object: registry.actor }, { animation: true });
  }

  /**
   * todo;
   */
  public override execute(): void {
    super.execute();
  }
}

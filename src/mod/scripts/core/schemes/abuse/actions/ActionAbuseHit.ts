import { action_base, LuabindClass } from "xray16";

import { registry } from "@/mod/scripts/core/database";
import { ISchemeAbuseState } from "@/mod/scripts/core/schemes/abuse/ISchemeAbuseState";
import { set_state } from "@/mod/scripts/core/state_management/StateManager";

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
    const { set_state } = require("@/mod/scripts/core/state_management/StateManager");

    set_state(this.object, "punch", null, null, { look_object: registry.actor }, { animation: true });
  }

  /**
   * todo;
   */
  public override execute(): void {
    super.execute();
  }
}

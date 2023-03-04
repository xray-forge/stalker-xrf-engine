import { action_base } from "xray16";

import { registry } from "@/mod/scripts/core/database";
import { ISchemeAbuseState } from "@/mod/scripts/core/schemes/abuse/ISchemeAbuseState";
import { set_state } from "@/mod/scripts/core/state_management/StateManager";

/**
 * todo
 */
@LuabindClass()
export class ActionAbuseHit extends action_base {
  public readonly state: ISchemeAbuseState;

  public constructor(storage: ISchemeAbuseState) {
    super(null, ActionAbuseHit.__name);
    this.state = storage;
  }

  public override initialize(): void {
    super.initialize();

    // --    this.object.set_node_evaluator()
    // --    this.object.set_path_evaluator()
    this.object.set_desired_position();
    this.object.set_desired_direction();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { set_state } = require("@/mod/scripts/core/state_management/StateManager");

    set_state(this.object, "punch", null, null, { look_object: registry.actor }, { animation: true });
  }

  public override execute(): void {
    super.execute();
  }
}

import { action_base, LuabindClass } from "xray16";

import { ISchemeHelpWoundedState } from "@/mod/scripts/core/schemes/help_wounded";
import { set_state } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(FILENAME);

/**
 * todo;
 */
@LuabindClass()
export class ActionHelpWounded extends action_base {
  public readonly state: ISchemeHelpWoundedState;

  /**
   * todo;
   */
  public constructor(state: ISchemeHelpWoundedState) {
    super(null, ActionHelpWounded.__name);
    this.state = state;
  }

  /**
   * todo;
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();
    this.object.set_dest_level_vertex_id(this.state.vertex_id);

    set_state(this.object, "patrol", null, null, null, null);
  }

  /**
   * todo;
   */
  public override execute(): void {
    super.execute();

    if (this.object.position().distance_to_sqr(this.state.vertex_position) > 2) {
      return;
    }

    set_state(
      this.object,
      "help_wounded",
      null,
      null,
      { look_position: this.state.vertex_position, look_object: null },
      null
    );
  }
}

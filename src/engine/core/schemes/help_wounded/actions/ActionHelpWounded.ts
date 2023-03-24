import { action_base, LuabindClass } from "xray16";

import { setStalkerState } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/state";
import { ISchemeHelpWoundedState } from "@/engine/core/schemes/help_wounded";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionHelpWounded extends action_base {
  public readonly state: ISchemeHelpWoundedState;

  public constructor(state: ISchemeHelpWoundedState) {
    super(null, ActionHelpWounded.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();
    this.object.set_dest_level_vertex_id(this.state.vertex_id);

    setStalkerState(this.object, EStalkerState.PATROL, null, null, null, null);
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    if (this.object.position().distance_to_sqr(this.state.vertex_position) > 2) {
      return;
    }

    setStalkerState(
      this.object,
      EStalkerState.HELP_WOUNDED,
      null,
      null,
      { look_position: this.state.vertex_position, look_object: null },
      null
    );
  }
}

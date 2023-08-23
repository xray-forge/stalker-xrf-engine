import { action_base, LuabindClass } from "xray16";

import { setStalkerState } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/animation";
import { ISchemeHelpWoundedState } from "@/engine/core/schemes/help_wounded";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action class describing how stalkers help each other when one of them is wounded.
 */
@LuabindClass()
export class ActionHelpWounded extends action_base {
  public readonly state: ISchemeHelpWoundedState;

  public constructor(state: ISchemeHelpWoundedState) {
    super(null, ActionHelpWounded.__name);
    this.state = state;
  }

  /**
   * On init set destination vertex of wounded object and try to reach it.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.object.set_dest_level_vertex_id(this.state.selectedWoundedVertexId);

    setStalkerState(this.object, EStalkerState.PATROL);
  }

  /**
   * Wait for object to reach target location.
   * Then run heal up animation.
   * On animation end separate callback to heal target will be called.
   */
  public override execute(): void {
    super.execute();

    if (this.object.position().distance_to_sqr(this.state.selectedWoundedVertexPosition) <= 2) {
      setStalkerState(this.object, EStalkerState.HELP_WOUNDED, null, null, {
        lookPosition: this.state.selectedWoundedVertexPosition,
        lookObjectId: null,
      });
    }
  }
}

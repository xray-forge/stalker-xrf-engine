import { action_base, LuabindClass } from "xray16";

import { set_state } from "@/engine/scripts/core/objects/state/StateManager";
import { ISchemeAnimpointState } from "@/engine/scripts/core/schemes/animpoint/ISchemeAnimpointState";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionAnimpoint extends action_base {
  public readonly state: ISchemeAnimpointState;

  /**
   * todo;
   */
  public constructor(state: ISchemeAnimpointState) {
    super(null, ActionAnimpoint.__name);
    this.state = state;
  }

  /**
   * todo;
   */
  public override initialize(): void {
    super.initialize();
    this.state.animpoint.start();
  }

  /**
   * todo;
   */
  public override finalize(): void {
    this.state.animpoint.stop();
    super.finalize();
  }

  /**
   * todo;
   */
  public net_destroy(): void {
    this.state.animpoint.stop();
  }

  /**
   * todo;
   */
  public override execute(): void {
    super.execute();

    const [pos, dir] = this.state.animpoint.get_animation_params();

    if (!this.state.animpoint.started) {
      this.state.animpoint.start();
    }

    set_state(
      this.object,
      this.state.animpoint.get_action()!,
      null,
      null,
      { look_position: this.state.animpoint.look_position, look_object: null },
      { animation_position: pos, animation_direction: dir }
    );
  }
}

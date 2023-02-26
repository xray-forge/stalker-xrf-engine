import { action_base } from "xray16";

import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { set_state } from "@/mod/scripts/core/state_management/StateManager";

/**
 * todo
 */
@LuabindClass()
export class ActionAbuseHit extends action_base {
  public state: IStoredObject;
  public hit_done: boolean = false;

  public constructor(storage: IStoredObject) {
    super(null, ActionAbuseHit.__name);
    this.state = storage;
  }

  public initialize(): void {
    super.initialize();

    // --    this.object.set_node_evaluator()
    // --    this.object.set_path_evaluator()
    this.object.set_desired_position();
    this.object.set_desired_direction();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { set_state } = require("@/mod/scripts/core/state_management/StateManager");

    set_state(this.object, "punch", null, null, { look_object: registry.actor }, { animation: true });
    // --    GlobalSound.set_sound_play(this.object.id(), "use_abuse")
    this.hit_done = true;
  }

  public execute(): void {
    super.execute();
  }
}

import { action_base, move } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { registry } from "@/mod/scripts/core/database";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActSmartCoverEnter",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActSmartCoverEnter extends action_base {
  public stateManager: StateManager;

  public constructor(st: StateManager) {
    super(null, StateManagerActSmartCoverEnter.__name);

    this.stateManager = st;
  }

  public initialize(): void {
    super.initialize();

    const state_descr = registry.objects.get(this.object.id())["smartcover"];

    // printf("setting smartcover [%s] for stalker [%s] ", tostring(state_descr.cover_name), this.object.name())
    this.object.use_smart_covers_only(true);
    this.object.set_movement_type(move.run);
    this.object.set_dest_smart_cover(state_descr.cover_name);

    if (state_descr.loophole_name !== null) {
      // printf("setting smartcover1 [%s] loophole [%s] for stalker [%s] ",
      // tostring(state_descr.cover_name), state_descr.loophole_name, this.object.name())
      this.object.set_dest_loophole(state_descr.loophole_name);
    }
  }

  public execute(): void {
    super.execute();
  }

  public finalize(): void {
    super.finalize();
  }
}

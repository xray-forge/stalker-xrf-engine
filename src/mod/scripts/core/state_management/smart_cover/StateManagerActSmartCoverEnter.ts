import { action_base, move, XR_action_base } from "xray16";

import { storage } from "@/mod/scripts/core/db";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerActSmartCoverEnter extends XR_action_base {
  st: StateManager;
}

export const StateManagerActSmartCoverEnter: IStateManagerActSmartCoverEnter = declare_xr_class(
  "StateManagerActSmartCoverEnter",
  action_base,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);

      // --this.move_mgr:finalize()
      // --this.move_mgr = db.storage[npc:id()].move_mgr
      const state_descr = storage.get(this.object.id())["smartcover"];

      // printf("setting smartcover [%s] for stalker [%s] ", tostring(state_descr.cover_name), this.object.name())
      this.object.use_smart_covers_only(true);
      this.object.set_movement_type(move.run);
      this.object.set_dest_smart_cover(state_descr.cover_name);

      if (state_descr.loophole_name !== null) {
        // printf("setting smartcover1 [%s] loophole [%s] for stalker [%s] ",
        // tostring(state_descr.cover_name), state_descr.loophole_name, this.object.name())
        this.object.set_dest_loophole(state_descr.loophole_name);
      }
    },
    execute(): void {
      action_base.execute(this);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActSmartCoverEnter
);

import { action_base, XR_action_base } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { get_idle_state, get_weapon } from "@/mod/scripts/core/state_management/weapon/StateManagerWeapon";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger(
  "StateManagerActWeaponUnstrapp",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerActWeaponUnstrapp extends XR_action_base {
  st: StateManager;
}

export const StateManagerActWeaponUnstrapp: IStateManagerActWeaponUnstrapp = declare_xr_class(
  "StateManagerActWeaponUnstrapp",
  action_base,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);
      this.object.set_item(get_idle_state(this.st.target_state), get_weapon(this.object, this.st.target_state));
    },
    execute(): void {
      log.info("Act weapon unstrapp");
      action_base.execute(this);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActWeaponUnstrapp
);

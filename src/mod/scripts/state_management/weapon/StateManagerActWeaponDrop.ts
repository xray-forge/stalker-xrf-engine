import { action_base, object, XR_action_base, XR_game_object } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { StateManager } from "@/mod/scripts/state_management/StateManager";
import { get_weapon } from "@/mod/scripts/state_management/weapon/StateManagerWeapon";
import { setItemCondition } from "@/mod/scripts/utils/alife";
import { isStrappableWeapon } from "@/mod/scripts/utils/checkers";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActWeaponDrop",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerActWeaponDrop extends XR_action_base {
  st: StateManager;
}

export const StateManagerActWeaponDrop = declare_xr_class("StateManagerActWeaponDrop", action_base, {
  __init(name: string, st: StateManager): void {
    action_base.__init(this, null, name);

    this.st = st;
  },
  initialize(): void {
    action_base.initialize(this);

    const weap: Optional<XR_game_object> = get_weapon(this.object, this.st.target_state);

    if (isStrappableWeapon(weap)) {
      this.object.set_item(object.drop, weap);
      setItemCondition(weap, math.random(40, 80));
    } else {
      this.object.set_item(object.idle, null);
    }
  },
  execute(): void {
    logger.info("Act weapon drop");
    action_base.execute(this);
  },
  finalize(): void {
    action_base.finalize(this);
  }
} as IStateManagerActWeaponDrop);

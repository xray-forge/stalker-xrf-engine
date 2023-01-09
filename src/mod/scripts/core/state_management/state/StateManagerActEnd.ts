import { action_base, game_object, level, object, time_global, XR_action_base } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { isStalker, isWeapon } from "@/mod/scripts/core/checkers";
import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { get_idle_state, get_queue_params } from "@/mod/scripts/core/state_management/weapon/StateManagerWeapon";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const aim_ratio: number = 1000 / 50;
const min_ratio: number = 1500;

const log: LuaLogger = new LuaLogger("StateManagerActEnd", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

export interface IStateManagerActEnd extends XR_action_base {
  st: StateManager;
  weapon_update(): void;
}

export const StateManagerActEnd: IStateManagerActEnd = declare_xr_class("StateManagerActEnd", action_base, {
  __init(name: string, st: StateManager): void {
    xr_class_super(null, name);
    this.st = st;
  },
  initialize(): void {
    action_base.initialize(this);
  },
  execute(): void {
    action_base.execute(this);

    this.weapon_update();
  },
  finalize(): void {
    action_base.finalize(this);
  },
  weapon_update(): void {
    if (this.st.callback !== null) {
      if (this.st.callback!.begin === null) {
        this.st.callback!.begin = time_global();
      }

      if (time_global() - this.st.callback!.begin >= this.st.callback.timeout!) {
        if (this.st.callback!.func !== null) {
          this.st.callback!.func(this.st.callback!.obj);
        }

        this.st.callback = null;
      }
    }

    const t: Optional<string> = states.get(this.st.target_state!).weapon;
    const w: boolean = isWeapon(this.object.best_weapon());

    if (!w) {
      return;
    }

    if (t === "fire" || t === "sniper_fire") {
      // --        printf("[%s] shooting", this.object.name())
      // todo: Configurable
      let sniper_aim = 3000;

      if (this.st.look_object !== null) {
        const look_object = level.object_by_id(this.st.look_object as number);

        if (look_object === null) {
          this.st.look_object = null;

          return;
        }

        if (
          this.object.see(look_object) !== null &&
          (!isStalker(look_object) || this.object.relation(look_object) === game_object.enemy) &&
          look_object.alive() === true
        ) {
          if (t === "sniper_fire") {
            sniper_aim = this.object.position().distance_to(look_object.position()) * aim_ratio;
            if (sniper_aim <= min_ratio) {
              this.object.set_item(object.fire1, this.object.best_weapon(), 1, min_ratio);

              return;
            }

            this.object.set_item(object.fire1, this.object.best_weapon(), 1, sniper_aim);
          } else {
            const [value] = get_queue_params(this.object, look_object, states.get(this.st.target_state!));

            this.object.set_item(object.fire1, this.object.best_weapon(), value);
          }

          return;
        } else {
          this.object.set_item(object.idle, this.object.best_weapon());

          return;
        }
      }

      if (this.st.look_position !== null && this.st.look_object === null) {
        if (t === "sniper_fire") {
          this.object.set_item(object.fire1, this.object.best_weapon(), 1, sniper_aim);
        } else {
          const [value] = get_queue_params(this.object, null, states.get(this.st.target_state!));

          this.object.set_item(object.fire1, this.object.best_weapon(), value);
        }

        return;
      }

      const [value] = get_queue_params(this.object, null, states.get(this.st.target_state!));

      this.object.set_item(object.fire1, this.object.best_weapon(), value);

      return;
    } else if (t === "unstrapped") {
      // --printf("[%s] not shooting", this.object.name())
      this.object.set_item(get_idle_state(this.st.target_state!), this.object.best_weapon());
    }
  }
} as IStateManagerActEnd);

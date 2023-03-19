import { action_base, game_object, level, LuabindClass, object, time_global } from "xray16";

import { states } from "@/engine/core/objects/state/lib/state_lib";
import { StateManager } from "@/engine/core/objects/state/StateManager";
import { get_idle_state, get_queue_params } from "@/engine/core/objects/state/weapon/StateManagerWeapon";
import { isStalker, isWeapon } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { Optional, TRate } from "@/engine/lib/types";

const aim_ratio: TRate = 1000 / 50;
const min_ratio: TRate = 1500;

const logger: LuaLogger = new LuaLogger($filename, gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActEnd extends action_base {
  public readonly stateManager: StateManager;

  /**
   * todo;
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerActEnd.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo;
   */
  public override initialize(): void {
    super.initialize();
  }

  /**
   * todo;
   */
  public override execute(): void {
    super.execute();
    this.weapon_update();
  }

  /**
   * todo;
   */
  public override finalize(): void {
    super.finalize();
  }

  /**
   * todo;
   */
  public weapon_update(): void {
    if (this.stateManager.callback !== null) {
      if (this.stateManager.callback!.begin === null) {
        this.stateManager.callback!.begin = time_global();
      }

      if (time_global() - this.stateManager.callback!.begin >= this.stateManager.callback.timeout!) {
        if (this.stateManager.callback!.func !== null) {
          this.stateManager.callback!.func(this.stateManager.callback!.obj);
        }

        this.stateManager.callback = null;
      }
    }

    const t: Optional<string> = states.get(this.stateManager.target_state!).weapon;
    const w: boolean = isWeapon(this.object.best_weapon());

    if (!w) {
      return;
    }

    if (t === "fire" || t === "sniper_fire") {
      // --        printf("[%s] shooting", this.object.name())
      // todo: Configurable
      let sniper_aim = 3000;

      if (this.stateManager.look_object !== null) {
        const look_object = level.object_by_id(this.stateManager.look_object as number);

        if (look_object === null) {
          this.stateManager.look_object = null;

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
            const [value] = get_queue_params(this.object, look_object, states.get(this.stateManager.target_state!));

            this.object.set_item(object.fire1, this.object.best_weapon(), value);
          }

          return;
        } else {
          this.object.set_item(object.idle, this.object.best_weapon());

          return;
        }
      }

      if (this.stateManager.look_position !== null && this.stateManager.look_object === null) {
        if (t === "sniper_fire") {
          this.object.set_item(object.fire1, this.object.best_weapon(), 1, sniper_aim);
        } else {
          const [value] = get_queue_params(this.object, null, states.get(this.stateManager.target_state!));

          this.object.set_item(object.fire1, this.object.best_weapon(), value);
        }

        return;
      }

      const [value] = get_queue_params(this.object, null, states.get(this.stateManager.target_state!));

      this.object.set_item(object.fire1, this.object.best_weapon(), value);

      return;
    } else if (t === "unstrapped") {
      // --printf("[%s] not shooting", this.object.name())
      this.object.set_item(get_idle_state(this.stateManager.target_state!), this.object.best_weapon());
    }
  }
}

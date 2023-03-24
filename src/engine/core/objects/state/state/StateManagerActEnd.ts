import { action_base, game_object, level, LuabindClass, object, time_global } from "xray16";

import { EWeaponAnimationType } from "@/engine/core/objects/state";
import { states } from "@/engine/core/objects/state/lib/state_lib";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { getObjectIdleState, getStateQueueParams } from "@/engine/core/objects/state/weapon/StateManagerWeapon";
import { isStalker, isWeapon } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { Optional, TRate } from "@/engine/lib/types";

const AIM_RATIO: TRate = 1000 / 50;
const MIN_RATIO: TRate = 1500;

const logger: LuaLogger = new LuaLogger($filename, gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActEnd extends action_base {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, StateManagerActEnd.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();
    this.weapon_update();
  }

  /**
   * todo: Description.
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

    const t: Optional<EWeaponAnimationType> = states.get(this.stateManager.target_state!).weapon;
    const w: boolean = isWeapon(this.object.best_weapon());

    if (!w) {
      return;
    }

    if (t === EWeaponAnimationType.FIRE || t === EWeaponAnimationType.SNIPER_FIRE) {
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
          if (t === EWeaponAnimationType.SNIPER_FIRE) {
            sniper_aim = this.object.position().distance_to(look_object.position()) * AIM_RATIO;
            if (sniper_aim <= MIN_RATIO) {
              this.object.set_item(object.fire1, this.object.best_weapon(), 1, MIN_RATIO);

              return;
            }

            this.object.set_item(object.fire1, this.object.best_weapon(), 1, sniper_aim);
          } else {
            const [value] = getStateQueueParams(this.object, states.get(this.stateManager.target_state!));

            this.object.set_item(object.fire1, this.object.best_weapon(), value);
          }

          return;
        } else {
          this.object.set_item(object.idle, this.object.best_weapon());

          return;
        }
      }

      if (this.stateManager.look_position !== null && this.stateManager.look_object === null) {
        if (t === EWeaponAnimationType.SNIPER_FIRE) {
          this.object.set_item(object.fire1, this.object.best_weapon(), 1, sniper_aim);
        } else {
          const [value] = getStateQueueParams(this.object, states.get(this.stateManager.target_state!));

          this.object.set_item(object.fire1, this.object.best_weapon(), value);
        }

        return;
      }

      const [value] = getStateQueueParams(this.object, states.get(this.stateManager.target_state!));

      this.object.set_item(object.fire1, this.object.best_weapon(), value);

      return;
    } else if (t === EWeaponAnimationType.UNSTRAPPED) {
      this.object.set_item(getObjectIdleState(this.stateManager.target_state!), this.object.best_weapon());
    }
  }
}

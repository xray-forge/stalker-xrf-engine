import { action_base, game_object, level, LuabindClass, object, time_global, XR_game_object } from "xray16";

import { EWeaponAnimation } from "@/engine/core/objects/state";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { getObjectIdleState, getStateQueueParams } from "@/engine/core/objects/state/weapon/StateManagerWeapon";
import { states } from "@/engine/core/objects/state_lib/state_lib";
import { isStalker, isWeapon } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TDuration, TRate, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const AIM_RATIO: TRate = 1000 / 50;
const MIN_RATIO: TRate = 1500;
const SNIPER_AIM_TIME: TDuration = 3000;

/**
 * todo;
 */
@LuabindClass()
export class ActionStateEnd extends action_base {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionStateEnd.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo;
   */
  public override initialize(): void {
    logger.info("End state for:", this.object.name());

    super.initialize();
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();
    this.updateWeapon();
  }

  /**
   * todo: Description.
   */
  public updateWeapon(): void {
    if (this.stateManager.callback !== null) {
      const now: TTimestamp = time_global();

      if (this.stateManager.callback.begin === null) {
        this.stateManager.callback.begin = now;
      }

      if (now - (this.stateManager.callback.begin as TTimestamp) >= (this.stateManager.callback.timeout as TDuration)) {
        if (this.stateManager.callback.callback !== null) {
          this.stateManager.callback.callback.call(this.stateManager.callback.context);
        }

        this.stateManager.callback = null;
      }
    }

    const targetWeaponState: Optional<EWeaponAnimation> = states.get(this.stateManager.targetState).weapon;

    if (!isWeapon(this.object.best_weapon())) {
      return;
    }

    if (targetWeaponState === EWeaponAnimation.FIRE || targetWeaponState === EWeaponAnimation.SNIPER_FIRE) {
      let sniperAimDuration: TDuration = SNIPER_AIM_TIME;

      if (this.stateManager.lookObjectId !== null) {
        const lookObject: Optional<XR_game_object> = level.object_by_id(this.stateManager.lookObjectId);

        if (lookObject === null) {
          this.stateManager.lookObjectId = null;

          return;
        }

        if (
          this.object.see(lookObject) !== null &&
          (!isStalker(lookObject) || this.object.relation(lookObject) === game_object.enemy) &&
          lookObject.alive()
        ) {
          if (targetWeaponState === EWeaponAnimation.SNIPER_FIRE) {
            sniperAimDuration = this.object.position().distance_to(lookObject.position()) * AIM_RATIO;
            if (sniperAimDuration <= MIN_RATIO) {
              this.object.set_item(object.fire1, this.object.best_weapon(), 1, MIN_RATIO);

              return;
            }

            this.object.set_item(object.fire1, this.object.best_weapon(), 1, sniperAimDuration);
          } else {
            const [value] = getStateQueueParams(this.object, states.get(this.stateManager.targetState!));

            this.object.set_item(object.fire1, this.object.best_weapon(), value);
          }

          return;
        } else {
          this.object.set_item(object.idle, this.object.best_weapon());

          return;
        }
      }

      if (this.stateManager.lookPosition !== null && this.stateManager.lookObjectId === null) {
        if (targetWeaponState === EWeaponAnimation.SNIPER_FIRE) {
          this.object.set_item(object.fire1, this.object.best_weapon(), 1, sniperAimDuration);
        } else {
          const [value] = getStateQueueParams(this.object, states.get(this.stateManager.targetState!));

          this.object.set_item(object.fire1, this.object.best_weapon(), value);
        }

        return;
      }

      const [value] = getStateQueueParams(this.object, states.get(this.stateManager.targetState!));

      this.object.set_item(object.fire1, this.object.best_weapon(), value);

      return;
    } else if (targetWeaponState === EWeaponAnimation.UNSTRAPPED) {
      this.object.set_item(getObjectIdleState(this.stateManager.targetState!), this.object.best_weapon());
    }
  }
}

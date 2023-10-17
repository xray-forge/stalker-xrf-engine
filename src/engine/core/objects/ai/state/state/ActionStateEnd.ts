import { action_base, level, LuabindClass, object, time_global } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { states } from "@/engine/core/objects/animation/states";
import { EWeaponAnimation } from "@/engine/core/objects/animation/types";
import { isStalker, isWeapon } from "@/engine/core/utils/class_ids";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSmartCoverStateQueueParams } from "@/engine/core/utils/smart_cover";
import { getWeaponActionForAnimationState } from "@/engine/core/utils/weapon";
import { EGameObjectRelation, GameObject, Optional, TDuration, TRate, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

// todo: Move out.
const AIM_RATIO: TRate = 1000 / 50;
const MIN_RATIO: TRate = 1500;
const SNIPER_AIM_TIME: TDuration = 3000;

/**
 * Try to end animation and call matching callbacks.
 * Optionally adjusts current weapon state to match desired.
 */
@LuabindClass()
export class ActionStateEnd extends action_base {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionStateEnd.__name);
    this.stateManager = stateManager;
  }

  /**
   * Try to end current state.
   */
  public override execute(): void {
    super.execute();

    // Handle callback execution of animation.
    if (this.stateManager.callback !== null) {
      const now: TTimestamp = time_global();

      // Set start of animation timeout.
      if (this.stateManager.callback.begin === null) {
        this.stateManager.callback.begin = now;
      }

      // Verify duration of timeout.
      if (now - (this.stateManager.callback.begin as TTimestamp) >= (this.stateManager.callback.timeout as TDuration)) {
        if (this.stateManager.callback.callback !== null) {
          logger.info("Animation ended with callback:", this.object.name(), this.stateManager.targetState);
          this.stateManager.callback.callback.call(this.stateManager.callback.context);
        }

        // Reset timeout to be executed only once.
        this.stateManager.callback = null;
      }
    }

    if (!isWeapon(this.object.best_weapon())) {
      return;
    }

    const targetWeaponState: Optional<EWeaponAnimation> = states.get(this.stateManager.targetState).weapon;

    if (targetWeaponState === EWeaponAnimation.FIRE || targetWeaponState === EWeaponAnimation.SNIPER_FIRE) {
      let sniperAimDuration: TDuration = SNIPER_AIM_TIME;

      if (this.stateManager.lookObjectId !== null) {
        const lookObject: Optional<GameObject> = level.object_by_id(this.stateManager.lookObjectId);

        if (lookObject === null) {
          this.stateManager.lookObjectId = null;

          return;
        }

        if (
          this.object.see(lookObject) !== null &&
          (!isStalker(lookObject) || this.object.relation(lookObject) === EGameObjectRelation.ENEMY) &&
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
            const [value] = getObjectSmartCoverStateQueueParams(
              this.object,
              states.get(this.stateManager.targetState!)
            );

            this.object.set_item(object.fire1, this.object.best_weapon(), value);
          }

          return;
        } else {
          this.object.set_item(object.idle, this.object.best_weapon());

          return;
        }
      }

      if (this.stateManager.lookPosition && !this.stateManager.lookObjectId) {
        if (targetWeaponState === EWeaponAnimation.SNIPER_FIRE) {
          this.object.set_item(object.fire1, this.object.best_weapon(), 1, sniperAimDuration);
        } else {
          const [value] = getObjectSmartCoverStateQueueParams(this.object, states.get(this.stateManager.targetState!));

          this.object.set_item(object.fire1, this.object.best_weapon(), value);
        }

        return;
      }

      const [value] = getObjectSmartCoverStateQueueParams(this.object, states.get(this.stateManager.targetState!));

      this.object.set_item(object.fire1, this.object.best_weapon(), value);

      return;
    } else if (targetWeaponState === EWeaponAnimation.UNSTRAPPED) {
      // Unstrap weapon.
      this.object.set_item(getWeaponActionForAnimationState(this.stateManager.targetState), this.object.best_weapon());
    }
  }
}

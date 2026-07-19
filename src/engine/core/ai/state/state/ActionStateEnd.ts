import { action_base, level, LuabindClass, object, time_global } from "xray16";
import { EGameObjectRelation, GameObject } from "xray16/alias";
import { Nillable, TDuration, TRate, TTimestamp } from "xray16/lib";
import { $filename, $isNil } from "xray16/macros";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";
import { EWeaponAnimation } from "@/engine/core/animation/types";
import { isStalker, isWeapon } from "@/engine/core/utils/class_ids";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSmartCoverStateQueueParams } from "@/engine/core/utils/smart_cover";
import { getWeaponActionForAnimationState } from "@/engine/core/utils/weapon";

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
  public readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionStateEnd.__name);
    this.controller = controller;
  }

  /**
   * Try to end current state.
   */
  public override execute(): void {
    super.execute();

    // Handle callback execution of animation.
    if (this.controller.callback) {
      const now: TTimestamp = time_global();

      // Set start of animation timeout.
      if ($isNil(this.controller.callback.begin)) {
        this.controller.callback.begin = now;
      }

      // Verify duration of timeout.
      if (now - (this.controller.callback.begin as TTimestamp) >= (this.controller.callback.timeout as TDuration)) {
        if (this.controller.callback.callback) {
          logger.info("Animation ended with callback: %s %s", this.object.name(), this.controller.targetState);
          this.controller.callback.callback.call(this.controller.callback.context);
        }

        // Reset timeout to be executed only once.
        this.controller.callback = null;
      }
    }

    if (!isWeapon(this.object.best_weapon())) {
      return;
    }

    const targetWeaponState: Nillable<EWeaponAnimation> = states.get(this.controller.targetState).weapon;

    if (targetWeaponState === EWeaponAnimation.FIRE || targetWeaponState === EWeaponAnimation.SNIPER_FIRE) {
      let sniperAimDuration: TDuration = SNIPER_AIM_TIME;

      if (this.controller.lookObjectId) {
        const lookObject: Nillable<GameObject> = level.object_by_id(this.controller.lookObjectId);

        if (!lookObject) {
          this.controller.lookObjectId = null;

          return;
        }

        if (
          this.object.see(lookObject) &&
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
            const [value] = getObjectSmartCoverStateQueueParams(this.object, states.get(this.controller.targetState!));

            this.object.set_item(object.fire1, this.object.best_weapon(), value);
          }

          return;
        } else {
          this.object.set_item(object.idle, this.object.best_weapon());

          return;
        }
      }

      if (this.controller.lookPosition && !this.controller.lookObjectId) {
        if (targetWeaponState === EWeaponAnimation.SNIPER_FIRE) {
          this.object.set_item(object.fire1, this.object.best_weapon(), 1, sniperAimDuration);
        } else {
          const [value] = getObjectSmartCoverStateQueueParams(this.object, states.get(this.controller.targetState!));

          this.object.set_item(object.fire1, this.object.best_weapon(), value);
        }

        return;
      }

      const [value] = getObjectSmartCoverStateQueueParams(this.object, states.get(this.controller.targetState!));

      this.object.set_item(object.fire1, this.object.best_weapon(), value);

      return;
    } else if (targetWeaponState === EWeaponAnimation.UNSTRAPPED) {
      // Unstrap weapon.
      this.object.set_item(getWeaponActionForAnimationState(this.controller.targetState), this.object.best_weapon());
    }
  }
}

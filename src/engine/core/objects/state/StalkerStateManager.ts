import { action_planner, object, time_global, XR_action_planner, XR_game_object, XR_vector } from "xray16";

import { StalkerAnimationManager } from "@/engine/core/objects/state/StalkerAnimationManager";
import {
  EStalkerState,
  EStateActionId,
  EWeaponAnimation,
  ITargetStateDescriptor,
} from "@/engine/core/objects/state/types";
import { getObjectAnimationWeapon } from "@/engine/core/objects/state/weapon/StateManagerWeapon";
import { states } from "@/engine/core/objects/state_lib/state_lib";
import { LuaLogger } from "@/engine/core/utils/logging";
import { areSameVectors } from "@/engine/core/utils/vector";
import { AnyCallable, AnyObject, Optional, TDuration, TNumberId, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export interface IStateManagerCallbackDescriptor {
  begin?: Optional<TTimestamp>;
  timeout?: Optional<TDuration>;
  turn_end_func?: Optional<AnyCallable>;
  func: Optional<AnyCallable>;
  obj: AnyObject;
}

/**
 * todo;
 */
export interface ITargetStateDescriptorExtras {
  isForced?: boolean;
  animation?: boolean;
  animation_position?: Optional<XR_vector>;
  animation_direction?: Optional<XR_vector>;
}

/**
 * todo:
 * - Refactor and simplify
 * - Simplify creation of actions with some helper function and evaluators descriptor?
 */
export class StalkerStateManager {
  public object: XR_game_object;
  public planner: XR_action_planner;

  public isCombat: boolean = false;
  public isAlife: boolean = true;
  public isForced: boolean = false;

  public isObjectPointDirectionLook: boolean = false;
  public isPositionDirectionApplied: boolean = false;

  public animation!: StalkerAnimationManager;
  public animstate!: StalkerAnimationManager;
  public animationPosition: Optional<XR_vector> = null;
  public animationDirection: Optional<XR_vector> = null;

  public targetState: EStalkerState = EStalkerState.IDLE;
  public callback: Optional<IStateManagerCallbackDescriptor> = null;

  public lookPosition: Optional<XR_vector> = null;
  public lookObjectId: Optional<TNumberId> = null;

  public constructor(object: XR_game_object) {
    this.object = object;
    this.planner = new action_planner();
    this.planner.setup(object);
  }

  /**
   * Get target state of manager.
   */
  public getState(): Optional<EStalkerState> {
    return this.targetState;
  }

  /**
   * todo: Description.
   */
  public setState(
    stateName: EStalkerState,
    callback: Optional<IStateManagerCallbackDescriptor>,
    timeout: Optional<TDuration>,
    target: Optional<ITargetStateDescriptor>,
    extra: Optional<ITargetStateDescriptorExtras>
  ): void {
    assert(states.get(stateName), "Invalid set state called: '%s' fo '%s'.", stateName, this.object.name());

    if (target !== null) {
      this.lookPosition = target.look_position;

      if (target.look_object !== null) {
        this.lookObjectId = target.look_object.id();
      } else {
        this.lookObjectId = null;
      }
    } else {
      this.lookPosition = null;
      this.lookObjectId = null;
    }

    if (this.targetState !== stateName) {
      if (
        (states.get(this.targetState).weapon === EWeaponAnimation.FIRE ||
          states.get(this.targetState).weapon === EWeaponAnimation.SNIPER_FIRE) &&
        states.get(stateName).weapon !== EWeaponAnimation.FIRE &&
        states.get(stateName).weapon !== EWeaponAnimation.SNIPER_FIRE
      ) {
        if (this.object.weapon_unstrapped()) {
          this.object.set_item(object.idle, getObjectAnimationWeapon(this.object, stateName));
        }
      }

      if (states.get(stateName).special_danger_move === true) {
        if (this.object.special_danger_move() !== true) {
          this.object.special_danger_move(true);
        }
      } else {
        if (this.object.special_danger_move() === true) {
          this.object.special_danger_move(false);
        }
      }

      this.targetState = stateName;

      if (extra !== null) {
        this.isForced = extra.isForced === true;

        if (
          this.isPositionDirectionApplied === false ||
          (this.animationPosition !== null &&
            extra.animation_position !== null &&
            !areSameVectors(this.animationPosition, extra.animation_position as XR_vector)) ||
          (this.animationDirection !== null &&
            extra.animation_direction !== null &&
            !areSameVectors(this.animationDirection, extra.animation_direction as XR_vector))
        ) {
          this.animationPosition = extra.animation_position as Optional<XR_vector>;
          this.animationDirection = extra.animation_direction as Optional<XR_vector>;
          this.isPositionDirectionApplied = false;
        }
      } else {
        this.animationPosition = null;
        this.animationDirection = null;
        this.isPositionDirectionApplied = false;
        this.isForced = false;
      }

      this.callback = callback;

      if (timeout !== null && timeout >= 0) {
        this.callback!.timeout = timeout;
        this.callback!.begin = null;
      } else if (this.callback) {
        this.callback.func = null;
        this.callback.timeout = null;
      }
    }
  }

  /**
   * todo: Description.
   */
  public update(): void {
    if (this.animation.states.current_state === states.get(this.targetState).animation) {
      if (this.callback !== null && this.callback.func !== null) {
        const now: TTimestamp = time_global();

        if (this.callback.begin === null) {
          this.callback.begin = now;
        } else {
          if (now - (this.callback.begin as TTimestamp) >= this.callback.timeout!) {
            logger.info("Callback called:", this);

            const callbackFunction = this.callback.func;
            const callbackParameter = this.callback.obj;

            this.callback.begin = null;
            this.callback.func = null;

            callbackFunction(callbackParameter);
          }
        }
      }
    }

    this.planner.update();

    if (!this.planner.initialized()) {
      return;
    }

    let plannerPreviousActionId: Optional<TNumberId> = null;
    let plannerCurrentActionId: TNumberId = this.planner.current_action_id();

    while (
      plannerCurrentActionId !== plannerPreviousActionId &&
      plannerCurrentActionId !== EStateActionId.end &&
      plannerCurrentActionId !== EStateActionId.locked
    ) {
      plannerPreviousActionId = plannerCurrentActionId;
      this.planner.update();
      plannerCurrentActionId = this.planner.current_action_id();
    }
  }
}

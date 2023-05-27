import { action_planner, level, look, object, time_global, vector } from "xray16";

import { StalkerAnimationManager } from "@/engine/core/objects/state/StalkerAnimationManager";
import {
  EStalkerState,
  EStateActionId,
  EStateEvaluatorId,
  EWeaponAnimation,
  ITargetStateDescriptor,
} from "@/engine/core/objects/state/types";
import { getObjectAnimationWeapon } from "@/engine/core/objects/state/weapon/StateManagerWeapon";
import { states } from "@/engine/core/objects/state_lib/state_lib";
import { assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { areSameVectors } from "@/engine/core/utils/vector";
import {
  ActionPlanner,
  AnyCallable,
  AnyContextualCallable,
  AnyObject,
  ClientObject,
  Optional,
  TDuration,
  TLookType,
  TNumberId,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export interface IStateManagerCallbackDescriptor<T extends AnyObject = AnyObject> {
  begin?: Optional<TTimestamp>;
  timeout?: Optional<TDuration>;
  context: T;
  callback: Optional<AnyContextualCallable<T>>;
  turnEndCallback?: Optional<AnyCallable>;
}

/**
 * todo;
 */
export interface ITargetStateDescriptorExtras {
  isForced?: boolean;
  animation?: boolean;
  animationPosition?: Optional<Vector>;
  animationDirection?: Optional<Vector>;
}

/**
 * todo;
 */
const LOOK_DIRECTION_STATES: LuaTable<EStalkerState, boolean> = $fromObject({
  threat_na: true,
  wait_na: true,
  guard_na: true,
} as Record<EStalkerState, boolean>);

/**
 * todo:
 * - Refactor and simplify
 * - Simplify creation of actions with some helper function and evaluators descriptor?
 */
export class StalkerStateManager {
  public object: ClientObject;
  public planner: ActionPlanner;

  public isCombat: boolean = false;
  public isAlife: boolean = true;
  public isForced: boolean = false;

  public isObjectPointDirectionLook: boolean = false;
  public isPositionDirectionApplied: boolean = false;

  public animation!: StalkerAnimationManager;
  public animstate!: StalkerAnimationManager;
  public animationPosition: Optional<Vector> = null;
  public animationDirection: Optional<Vector> = null;

  public targetState: EStalkerState = EStalkerState.IDLE;
  public callback: Optional<IStateManagerCallbackDescriptor> = null;

  public lookPosition: Optional<Vector> = null;
  public lookObjectId: Optional<TNumberId> = null;

  public constructor(object: ClientObject) {
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
   * Set object animation state.
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
            extra.animationPosition !== null &&
            !areSameVectors(this.animationPosition, extra.animationPosition as Vector)) ||
          (this.animationDirection !== null &&
            extra.animationDirection !== null &&
            !areSameVectors(this.animationDirection, extra.animationDirection as Vector))
        ) {
          this.animationPosition = extra.animationPosition as Optional<Vector>;
          this.animationDirection = extra.animationDirection as Optional<Vector>;
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
        this.callback.callback = null;
        this.callback.timeout = null;
      }
    }
  }

  /**
   * todo: Description.
   */
  public update(): void {
    if (this.animation.states.currentState === states.get(this.targetState).animation) {
      if (this.callback !== null && this.callback.callback !== null) {
        const now: TTimestamp = time_global();

        if (this.callback.begin === null) {
          this.callback.begin = now;
        } else {
          if (now - (this.callback.begin as TTimestamp) >= this.callback.timeout!) {
            logger.info("Animation callback called:", this);

            const callbackFunction: AnyCallable = this.callback.callback as unknown as AnyCallable;

            this.callback.begin = null;
            this.callback.callback = null;

            callbackFunction(this.callback.context);
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

  /**
   * todo;
   */
  public lookAtObject(): void {
    this.isObjectPointDirectionLook = this.getLookObjectType();

    if (this.isObjectPointDirectionLook) {
      this.object.set_sight(level.object_by_id(this.lookObjectId!)!, true, false, false);
    } else {
      this.object.set_sight(level.object_by_id(this.lookObjectId!)!, true, true);
    }
  }

  /**
   * todo;
   */
  public getLookObjectType(): boolean {
    if (LOOK_DIRECTION_STATES.get(this.targetState)) {
      return true;
    }

    return states.get(this.targetState).animation !== null;
  }

  /**
   * todo;
   */
  public getObjectLookPositionType(): TLookType {
    if (states.get(this.targetState).direction !== null) {
      return states.get(this.targetState).direction! as TLookType;
    }

    if (!this.planner.evaluator(EStateEvaluatorId.movement_stand).evaluate()) {
      if (this.lookPosition !== null) {
        return look.direction;
      }

      return look.path_dir;
    }

    if (this.lookPosition !== null) {
      return look.direction;
    }

    return look.danger;
  }

  /**
   * todo;
   */
  public turn(): void {
    this.isObjectPointDirectionLook = this.getLookObjectType();

    if (this.lookObjectId !== null && level.object_by_id(this.lookObjectId) !== null) {
      this.lookAtObject();
    } else if (this.lookPosition !== null) {
      let direction: Vector = new vector().sub(this.lookPosition!, this.object.position());

      if (this.isObjectPointDirectionLook) {
        direction.y = 0;
      }

      direction.normalize();

      if (areSameVectors(direction, new vector().set(0, 0, 0))) {
        this.lookPosition = new vector().set(
          this.object.position().x + this.object.direction().x,
          this.object.position().y + this.object.direction().y,
          this.object.position().z + this.object.direction().z
        );
        direction = this.object.direction();
      }

      this.object.set_sight(look.direction, direction, true);
    }
  }
}

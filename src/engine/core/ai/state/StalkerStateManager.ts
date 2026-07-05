import { action_planner, level, look, object, time_global } from "xray16";
import { ActionPlanner, GameObject, TLookType, Vector } from "xray16/alias";
import { $filename, $isNil, $isNotNil } from "xray16/macros";

import { StalkerAnimationManager } from "@/engine/core/ai/state/StalkerAnimationManager";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";
import { states } from "@/engine/core/animation/states";
import { EAnimationType, EWeaponAnimation } from "@/engine/core/animation/types/animation_types";
import {
  EStalkerState,
  ILookTargetDescriptor,
  IStateManagerCallbackDescriptor,
  ITargetStateDescriptorExtras,
  LOOK_DIRECTION_STATES,
} from "@/engine/core/animation/types/state_types";
import { registry } from "@/engine/core/database";
import { assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { areSameVectors, createVector, subVectors } from "@/engine/core/utils/vector";
import { getObjectWeaponForAnimationState } from "@/engine/core/utils/weapon";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import { AnyCallable, Nillable, TDuration, TNumberId, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { file: "ai_state" });

/**
 * State manager of any stalker game object.
 * Handles animation, different states and body positioning when stalkers are doing anything.
 */
export class StalkerStateManager {
  public readonly object: GameObject;
  public readonly planner: ActionPlanner;

  public controller: Nillable<EAnimationType> = null;

  public isAlife: boolean = true;
  public isCombat: boolean = false;
  public isForced: boolean = false;

  public isObjectPointDirectionLook: boolean = false;
  public isAnimationDirectionApplied: boolean = false;

  public animation: StalkerAnimationManager;
  public animstate: StalkerAnimationManager;

  public animationPosition: Nillable<Vector> = null;
  public animationDirection: Nillable<Vector> = null;

  public targetState: EStalkerState = EStalkerState.IDLE;
  public callback: Nillable<IStateManagerCallbackDescriptor> = null;

  public lookPosition: Nillable<Vector> = null;
  public lookObjectId: Nillable<TNumberId> = null;

  public constructor(object: GameObject) {
    this.object = object;
    this.planner = new action_planner();
    this.planner.setup(object);
    this.animstate = new StalkerAnimationManager(object, this, EAnimationType.ANIMSTATE);
    this.animation = new StalkerAnimationManager(object, this, EAnimationType.ANIMATION);
  }

  /**
   * Get target state of game object state manager.
   *
   * @returns Target state or null.
   */
  public getState(): Nillable<EStalkerState> {
    return this.targetState;
  }

  /**
   * Set object animation state.
   *
   * @param state - Target game state to set.
   * @param callback - State manager callback for call once state is set.
   * @param timeout - Time to wait for callback call once state is set.
   * @param target - Target look/position description for state.
   * @param extra - Additional configuration of state.
   */
  public setState(
    state: EStalkerState,
    callback: Nillable<IStateManagerCallbackDescriptor>,
    timeout: Nillable<TDuration>,
    target: Nillable<ILookTargetDescriptor>,
    extra: Nillable<ITargetStateDescriptorExtras>
  ): void {
    assert(states.get(state), "Invalid set state called: '%s' fo '%s'.", state, this.object.name());

    if (target) {
      this.lookPosition = target.lookPosition ?? null;
      this.lookObjectId = target.lookObjectId ?? null;
    } else {
      this.lookPosition = null;
      this.lookObjectId = null;
    }

    // Same state provided, just updated positioning and continue.
    if (this.targetState === state) {
      return;
    }

    logger.info("Set state: '%s', %s -> %s", this.object.name(), this.targetState, state);

    const previousStateDescriptorWeapon: Nillable<EWeaponAnimation> = states.get(this.targetState).weapon;
    const nextStateDescriptorWeapon: Nillable<EWeaponAnimation> = states.get(state).weapon;

    // Hide weapon if it is not needed for new animation.
    if (
      (previousStateDescriptorWeapon === EWeaponAnimation.FIRE ||
        previousStateDescriptorWeapon === EWeaponAnimation.SNIPER_FIRE) &&
      nextStateDescriptorWeapon !== EWeaponAnimation.FIRE &&
      nextStateDescriptorWeapon !== EWeaponAnimation.SNIPER_FIRE
    ) {
      if (this.object.active_item() && this.object.best_weapon() && this.object.weapon_unstrapped()) {
        this.object.set_item(object.idle, getObjectWeaponForAnimationState(this.object, state));
      }
    }

    this.targetState = state;

    const hasSpecialDangerMove: boolean = states.get(state).special_danger_move === true;

    // Process special danger move if it is not with same state.
    if (this.object.special_danger_move() !== hasSpecialDangerMove) {
      this.object.special_danger_move(hasSpecialDangerMove);
    }

    // Process extra fields.
    if (extra) {
      this.isForced = extra.isForced === true;

      // If position or direction are changed, reset applied state.
      if (
        (this.animationPosition &&
          extra.animationPosition &&
          !areSameVectors(this.animationPosition, extra.animationPosition as Vector)) ||
        (this.animationDirection &&
          extra.animationDirection &&
          !areSameVectors(this.animationDirection, extra.animationDirection as Vector))
      ) {
        this.isAnimationDirectionApplied = false;
      }

      this.animationPosition = extra.animationPosition as Nillable<Vector>;
      this.animationDirection = extra.animationDirection as Nillable<Vector>;
    } else {
      this.isAnimationDirectionApplied = false;
      this.animationPosition = null;
      this.animationDirection = null;
      this.isForced = false;
    }

    // Process additional callback.
    this.callback = callback;

    if (this.callback) {
      if ($isNotNil(timeout) && timeout >= 0) {
        this.callback.timeout = timeout;
        this.callback.begin = null;
      } else {
        this.callback.callback = null;
        this.callback.timeout = null;
      }
    }
  }

  /**
   * State manager update tick.
   */
  public update(): void {
    // Notify set state callback if it is provided and desired state is set.
    if (
      this.callback &&
      this.callback.callback &&
      this.animation.state.currentState === states.get(this.targetState).animation
    ) {
      const now: TTimestamp = time_global();

      if ($isNil(this.callback.begin)) {
        this.callback.begin = now;
      } else {
        if (now - (this.callback.begin as TTimestamp) >= (this.callback.timeout as TDuration)) {
          logger.info("Animation callback called: %s", this.object.name());

          const callbackFunction: AnyCallable = this.callback.callback as unknown as AnyCallable;

          this.callback.begin = null;
          this.callback.callback = null;

          callbackFunction(this.callback.context);
        }
      }
    }

    // Force object action planner updates.
    this.planner.update();

    if (!this.planner.initialized()) {
      return;
    }

    let plannerPreviousActionId: Nillable<TNumberId> = null;
    let plannerCurrentActionId: TNumberId = this.planner.current_action_id();

    // Update planer till state is not set to end or locked.
    while (
      plannerCurrentActionId &&
      plannerCurrentActionId !== plannerPreviousActionId &&
      plannerCurrentActionId !== EStateActionId.END &&
      plannerCurrentActionId !== EStateActionId.LOCKED
    ) {
      this.planner.update();

      plannerPreviousActionId = plannerCurrentActionId;
      plannerCurrentActionId = this.planner.current_action_id();
    }
  }

  /**
   * Look at object defined by current animation.
   * Applies look type / direction / object.
   */
  public lookAtObject(): void {
    this.isObjectPointDirectionLook = this.isLookObjectType();

    if (this.isObjectPointDirectionLook) {
      this.object.set_sight(registry.objects.get(this.lookObjectId!).object, true, false, false);
    } else {
      this.object.set_sight(registry.objects.get(this.lookObjectId!).object, true, true);
    }
  }

  /**
   * Check whether the current target state requires looking towards a directional object rather than a position.
   *
   * @returns Whether the target state uses object-based look direction.
   */
  public isLookObjectType(): boolean {
    if (LOOK_DIRECTION_STATES.get(this.targetState)) {
      return true;
    }

    return $isNotNil(states.get(this.targetState).animation);
  }

  /**
   * Resolve the sight look type to use for the object based on the target state, look position and movement planner.
   *
   * @returns Look type that should be applied to the object sight.
   */
  public getObjectLookPositionType(): TLookType {
    // Has animation defined look direction.
    if ($isNotNil(states.get(this.targetState).direction)) {
      return states.get(this.targetState).direction as TLookType;
    }

    // Has look position defined.
    if (this.lookPosition) {
      return look.direction;
    }

    return this.planner.evaluator(EStateEvaluatorId.MOVEMENT_STAND_TARGET).evaluate() ? look.danger : look.path_dir;
  }

  /**
   * Apply the object sight towards the configured look object or look position for the current state.
   */
  public turn(): void {
    this.isObjectPointDirectionLook = this.isLookObjectType();

    if ($isNotNil(this.lookObjectId) && level.object_by_id(this.lookObjectId)) {
      this.lookAtObject();
    } else if (this.lookPosition) {
      let sightDirection: Vector = subVectors(this.lookPosition!, this.object.position());

      if (this.isObjectPointDirectionLook) {
        sightDirection.y = 0;
      }

      sightDirection.normalize();

      if (areSameVectors(sightDirection, ZERO_VECTOR)) {
        const objectPosition: Vector = this.object.position();
        const objectDirection: Vector = this.object.direction();

        this.lookPosition = createVector(
          objectPosition.x + objectDirection.x,
          objectPosition.y + objectDirection.y,
          objectPosition.z + objectDirection.z
        );
        sightDirection = this.object.direction();
      }

      this.object.set_sight(look.direction, sightDirection, true);
    }
  }
}

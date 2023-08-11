import { callback, hit, time_global } from "xray16";

import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import {
  EAnimationMarker,
  EAnimationType,
  IAnimationDescriptor,
  IAnimationDescriptorProperties,
  IAnimationManagerState,
  TAnimationSequenceElements,
} from "@/engine/core/objects/animation";
import { animations } from "@/engine/core/objects/animation/animations";
import { animstates } from "@/engine/core/objects/animation/animstates";
import { EStalkerState } from "@/engine/core/objects/animation/state_types";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectActiveWeaponSlot } from "@/engine/core/utils/object";
import { createVector, vectorRotateY } from "@/engine/core/utils/vector";
import {
  AnyCallable,
  ClientObject,
  Hit,
  LuaArray,
  Optional,
  TIndex,
  TName,
  TRate,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager of stalker object animations.
 * Handles transitions / active state / animation switching.
 * Ties engine animation callbacks and game logic.
 */
export class StalkerAnimationManager {
  public readonly type: EAnimationType;
  public readonly object: ClientObject;
  public readonly stateManager: StalkerStateManager;
  public readonly animations: LuaTable<TName, IAnimationDescriptor>;

  public readonly state: IAnimationManagerState = {
    lastIndex: null,
    currentState: null,
    targetState: null,
    animationMarker: null,
    nextRandomAt: null,
    sequenceId: 1,
  };

  public constructor(object: ClientObject, stateManager: StalkerStateManager, type: EAnimationType) {
    this.type = type;
    this.object = object;
    this.stateManager = stateManager;
    this.animations = type === EAnimationType.ANIMATION ? animations : animstates;
  }

  /**
   * Allow animation control based on animation manager.
   */
  public setControl(): void {
    this.object.set_callback(callback.script_animation, this.onAnimationCallback, this);

    // On animation control also reset animstate.
    if (this.type === EAnimationType.ANIMATION) {
      this.stateManager.animstate.state.animationMarker = null;
    }

    if (this.state.animationMarker === null) {
      this.updateAnimation();
    }
  }

  /**
   * Set new animation state and reset all markers.
   *
   * @param state - target state to set
   * @param isForced - whether state transition should be forced and skip all `out` animations
   */
  public setState(state: Optional<EStalkerState>, isForced?: Optional<boolean>): void {
    const now: TTimestamp = time_global();

    if (state !== this.state.targetState) {
      logger.format("Set state: '%s', '%s', %s -> %s", this.object.name(), this.type, this.state.targetState, state);
    }

    /**
     * Force animation apply without waiting for previous end.
     */
    if (isForced === true) {
      this.object.clear_animations();

      const currentState: Optional<IAnimationDescriptor> =
        this.state.animationMarker === EAnimationMarker.IN
          ? this.animations.get(this.state.targetState!)
          : this.animations.get(this.state.currentState!);

      if (currentState?.out) {
        const weaponSlot: TIndex = getObjectActiveWeaponSlot(this.object);
        const animationForWeaponSlot = this.getAnimationForWeaponSlot(weaponSlot, currentState.out);

        if (animationForWeaponSlot !== null) {
          for (const [, nextAnimation] of animationForWeaponSlot) {
            if (type(nextAnimation) === "table") {
              this.processSpecialAction(nextAnimation as any);
            }
          }
        }
      }

      this.state.animationMarker = null;
      this.state.currentState = state;
      this.state.targetState = state;
      this.state.sequenceId = 1;
      this.state.nextRandomAt = now;

      return;
    }

    this.state.targetState = state;
    this.state.nextRandomAt = now;
  }

  /**
   * Update state of current animation.
   */
  public updateAnimation(): void {
    const [animation, state] = this.selectAnimation();

    if (animation !== null) {
      this.addAnimation(animation, state);
    }
  }

  /**
   * Add animation for object execution.
   *
   * @param animation - animation scenario name to execute by game object
   * @param animationDescriptor - animation descriptor to play
   */
  public addAnimation(animation: TName, animationDescriptor: IAnimationDescriptor): void {
    const object: ClientObject = this.object;
    const animationProperties: Optional<IAnimationDescriptorProperties> = animationDescriptor.prop;

    if (
      this.stateManager.animationPosition &&
      this.stateManager.animationDirection &&
      !this.stateManager.isAnimationDirectionApplied
    ) {
      this.stateManager.isAnimationDirectionApplied = true;

      const direction: Vector = createVector(
        0,
        -math.deg(math.atan2(this.stateManager.animationDirection.x, this.stateManager.animationDirection.z)),
        0
      );

      object.add_animation(animation, true, this.stateManager.animationPosition, direction, true);
    } else {
      object.add_animation(animation, true, animationProperties?.moving === true);
    }
  }

  /**
   * Get matching animation sequence for currently active weapon slot.
   * If weapon slot animation does not exist, return `0` from list.
   *
   * @param weaponSlot - active weapon slot of the game object
   * @param animationsList - animations scenarios list
   * @returns possible animation sequence for slot
   */
  public getAnimationForWeaponSlot(
    weaponSlot: TIndex,
    animationsList: LuaArray<TAnimationSequenceElements>
  ): Optional<LuaArray<TAnimationSequenceElements>> {
    if (animationsList.get(weaponSlot) === null) {
      weaponSlot = 0;
    }

    return $fromArray(animationsList.get(weaponSlot) as any);
  }

  /**
   * Select active animation for execution on update tick.
   *
   * @returns tuple with animation name and descriptor or tuple with nulls
   */
  public selectAnimation(): LuaMultiReturn<[TName, IAnimationDescriptor] | [null, null]> {
    const states: IAnimationManagerState = this.state;

    /**
     * New animation detected for playback change.
     */
    if (states.targetState !== states.currentState) {
      // Stopping all animations:
      if (states.targetState === null) {
        const animationDescriptor: IAnimationDescriptor = this.animations.get(states.currentState!);

        states.animationMarker = EAnimationMarker.OUT;

        // No way to transition out current animation, mark as executed and transition forward.
        if (animationDescriptor.out === null) {
          this.onAnimationCallback(true);

          return $multi(null, null);
        }

        const weaponSlot: TIndex = getObjectActiveWeaponSlot(this.object);
        const animationForWeaponSlot: Optional<LuaArray<TAnimationSequenceElements>> = this.getAnimationForWeaponSlot(
          weaponSlot,
          animationDescriptor.out
        );

        // No animation for current / 0 slot, mark as executed and transition forward.
        if (animationForWeaponSlot === null) {
          this.onAnimationCallback(true);

          return $multi(null, null);
        }

        const nextAnimation: TAnimationSequenceElements = animationForWeaponSlot.get(states.sequenceId);

        // Have complex animation action, execute it and process forward with multiple scenarios.
        if (type(nextAnimation) === "table") {
          this.processSpecialAction(nextAnimation as any);
          this.onAnimationCallback(false);

          return $multi(null, null);
        }

        // Possible have simple animation for 'out' play.
        return $multi(nextAnimation as unknown as TName, animationDescriptor);
      }

      // From idle (null) to new animation:
      if (states.currentState === null) {
        const state: IAnimationDescriptor = this.animations.get(states.targetState!);

        states.animationMarker = EAnimationMarker.IN;

        // No `into` animation, mark it as finished and proceed forward.
        if (state.into === null) {
          this.onAnimationCallback(true);

          return $multi(null, null);
        }

        const weaponSlot: TIndex = getObjectActiveWeaponSlot(this.object);
        const animationForWeaponSlot: Optional<LuaArray<TAnimationSequenceElements>> = this.getAnimationForWeaponSlot(
          weaponSlot,
          state.into
        );

        // No animation for desired weapon slot, mark as executed and proceed forward.
        if (animationForWeaponSlot === null) {
          this.onAnimationCallback(true);

          return $multi(null, null);
        }

        const nextAnimation: TAnimationSequenceElements = animationForWeaponSlot.get(states.sequenceId);

        // Next animation is complex, handle actions and proceed forward with callbacks.
        if (type(nextAnimation) === "table") {
          this.processSpecialAction(nextAnimation as any);
          this.onAnimationCallback(false);

          return $multi(null, null);
        }

        // Have possible simple `in` animation scenario, continue processing.
        return $multi(nextAnimation as unknown as TName, state);
      }
    }

    // Same non-null animation, processing idle state:
    if (states.targetState === states.currentState && states.currentState !== null) {
      const activeWeaponSlot: TIndex = getObjectActiveWeaponSlot(this.object);
      const state: IAnimationDescriptor = this.animations.get(states.currentState);

      let animation = null;

      // Select random animation for idle state, if random list is defined.
      if (state.rnd !== null) {
        animation = this.selectRandom(
          state as IAnimationDescriptor,
          activeWeaponSlot,
          time_global() >= states.nextRandomAt!
        );
      }

      // No random animation and idle is defined.
      if (animation === null && state.idle !== null) {
        animation = this.getAnimationForWeaponSlot(activeWeaponSlot, state.idle as any);
      }

      // Have animation for idle state so can define current marker state.
      if (animation) {
        states.animationMarker = EAnimationMarker.IDLE;
      }

      return $multi(animation as TName, state);
    }

    return $multi(null, null);
  }

  /**
   * Select random animation sequence to play for `rnd` animation.
   * Random animations are part of idle state to make actions more diverse.
   *
   * @param animationDescriptor - descriptor of animation to pick random from
   * @param weaponSlot - item slot to check animation for
   * @param shouldPlay - whether animation should be played
   * @returns random animation sequence if valid one exists
   */
  public selectRandom(
    animationDescriptor: IAnimationDescriptor,
    weaponSlot: TIndex,
    shouldPlay: boolean
  ): Optional<TAnimationSequenceElements> {
    if (!shouldPlay && math.random(100) > (this.animations.get(this.state.currentState!).prop.rnd as TRate)) {
      return null;
    }

    const animation: Optional<LuaArray<TAnimationSequenceElements>> = this.getAnimationForWeaponSlot(
      weaponSlot,
      animationDescriptor.rnd as LuaArray<TAnimationSequenceElements>
    );

    if (animation === null) {
      return null;
    }

    const states: IAnimationManagerState = this.state;
    let index: TIndex;

    if (animation.length() > 1) {
      if (states.lastIndex === null) {
        index = math.random(animation.length());
      } else {
        index = math.random(animation.length() - 1);

        if (index >= states.lastIndex) {
          index += 1;
        }
      }

      this.state.lastIndex = index;
    } else {
      index = 1;
    }

    return animation.get(index);
  }

  /**
   * Process special action as part of animation scenario.
   * It may include sounds/items/hit etc.
   *
   * @param actionTable - table with action to process
   */
  public processSpecialAction(actionTable: LuaTable): void {
    // Attach item.
    if (actionTable.get("a") !== null) {
      const objectInventoryItem: Optional<ClientObject> = this.object.object(actionTable.get("a"));

      if (objectInventoryItem !== null) {
        objectInventoryItem.enable_attachable_item(true);
      }
    }

    // Detach item.
    if (actionTable.get("d") !== null) {
      const objectInventoryItem: Optional<ClientObject> = this.object.object(actionTable.get("d"));

      if (objectInventoryItem !== null) {
        objectInventoryItem.enable_attachable_item(false);
      }
    }

    // Play sound.
    if (actionTable.get("s") !== null) {
      GlobalSoundManager.getInstance().playSound(this.object.id(), actionTable.get("s"), null, null);
    }

    // Hit object.
    if (actionTable.get("sh") !== null) {
      const hitObject: Hit = new hit();

      hitObject.power = actionTable.get("sh");
      hitObject.direction = vectorRotateY(this.object.direction(), 90);
      hitObject.draftsman = this.object;
      hitObject.impulse = 200;
      hitObject.type = hit.wound;

      this.object.hit(hitObject);
    }

    // Custom callback.
    const animationCallback: Optional<AnyCallable> = actionTable.get("f");

    if (animationCallback !== null) {
      animationCallback(this.object);
    }
  }

  /**
   * On animation scenario finish by an object.
   * Handle different phases of animation and proceed animations list of transform from one marker to another.
   *
   * @param skipMultiAnimationCheck - skip multiple animations scenario and transfer to another marker
   */
  public onAnimationCallback(skipMultiAnimationCheck?: boolean): void {
    if (this.state.animationMarker === null || this.object.animation_count() > 0) {
      return;
    }

    const states: IAnimationManagerState = this.state;

    switch (this.state.animationMarker) {
      case EAnimationMarker.IN: {
        states.animationMarker = null;

        if (skipMultiAnimationCheck !== true) {
          let intoList: Optional<LuaArray<TAnimationSequenceElements>> = new LuaTable();
          const targetAnimations = this.animations.get(states.targetState!);

          if (targetAnimations !== null && targetAnimations.into !== null) {
            intoList = this.getAnimationForWeaponSlot(getObjectActiveWeaponSlot(this.object), targetAnimations.into);
          }

          if (intoList !== null && intoList.length() > states.sequenceId) {
            states.sequenceId += 1;
            this.updateAnimation();

            return;
          }
        }

        states.sequenceId = 1;
        states.currentState = states.targetState;
        this.updateAnimation();

        return;
      }

      case EAnimationMarker.IDLE: {
        states.animationMarker = null;

        const properties: IAnimationDescriptorProperties = this.animations.get(states.currentState!).prop;

        if (properties.maxidle === 0) {
          states.nextRandomAt = time_global() + properties.sumidle * 1000;
        } else {
          states.nextRandomAt = time_global() + (properties.sumidle + math.random(properties.maxidle)) * 1000;
        }

        this.updateAnimation();

        return;
      }

      case EAnimationMarker.OUT: {
        states.animationMarker = null;

        if (skipMultiAnimationCheck !== true) {
          let outAnimationList: Optional<LuaArray<TAnimationSequenceElements>> = new LuaTable();

          if (this.animations.get(states.currentState as EStalkerState).out) {
            outAnimationList = this.getAnimationForWeaponSlot(
              getObjectActiveWeaponSlot(this.object),
              this.animations.get(states.currentState!).out as LuaArray<TAnimationSequenceElements>
            );
          }

          if (outAnimationList !== null && outAnimationList.length() > states.sequenceId) {
            states.sequenceId += 1;
            this.updateAnimation();

            return;
          }
        }

        states.sequenceId = 1;
        states.currentState = null;

        // After out animation set control to animstate.
        if (this.type === EAnimationType.ANIMATION) {
          this.stateManager.animstate.setControl();
          // --this.mgr.animstate:update_anim()
        }

        return;
      }
    }
  }
}

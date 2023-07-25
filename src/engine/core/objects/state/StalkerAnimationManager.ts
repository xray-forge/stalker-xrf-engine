import { callback, hit, time_global } from "xray16";

import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import {
  EAnimationMarker,
  EAnimationType,
  IAnimationDescriptor,
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
   * todo;
   */
  public setState(newState: Optional<EStalkerState>, isForced: Optional<boolean> = false): void {
    const now: TTimestamp = time_global();

    /**
     * Force animation over existing ones.
     */
    if (isForced === true) {
      this.object.clear_animations();

      const state: Optional<IAnimationDescriptor> =
        this.state.animationMarker === EAnimationMarker.IN
          ? this.animations.get(this.state.targetState!)
          : this.animations.get(this.state.currentState!);

      if (state?.out) {
        const weaponSlot: TIndex = getObjectActiveWeaponSlot(this.object);
        const animationForWeaponSlot = this.getAnimationForSlot(weaponSlot, state.out);

        if (animationForWeaponSlot !== null) {
          for (const [id, nextAnimation] of animationForWeaponSlot) {
            if (type(nextAnimation) === "table") {
              this.processSpecialAction(nextAnimation as any);
            }
          }
        }
      }

      this.state.animationMarker = null;
      this.state.currentState = newState;
      this.state.targetState = newState;
      this.state.sequenceId = 1;
      this.state.nextRandomAt = now;

      return;
    }

    this.state.targetState = newState;
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
   * todo;
   */
  public addAnimation(animation: TName, state: IAnimationDescriptor): void {
    const object: ClientObject = this.object;
    const animationProperties = state.prop;

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
    } else if (animationProperties === null || animationProperties.moving !== true) {
      object.add_animation(animation, true, false);
    } else {
      object.add_animation(animation, true, true);
    }
  }

  /**
   * todo;
   */
  public getAnimationForSlot(
    slot: TIndex,
    animationsList: LuaArray<TAnimationSequenceElements>
  ): Optional<LuaArray<TAnimationSequenceElements>> {
    if (animationsList.get(slot) === null) {
      slot = 0;
    }

    return $fromArray(animationsList.get(slot) as any);
  }

  /**
   * todo;
   */
  public selectAnimation(): LuaMultiReturn<[TName, IAnimationDescriptor] | [null, null]> {
    const states: IAnimationManagerState = this.state;

    // New animation detected:
    if (states.targetState !== states.currentState) {
      if (states.targetState === null) {
        const animationDescriptor: IAnimationDescriptor = this.animations.get(states.currentState!);

        if (animationDescriptor.out === null) {
          states.animationMarker = EAnimationMarker.OUT;
          this.onAnimationCallback(true);

          return $multi(null, null);
        }

        states.animationMarker = EAnimationMarker.OUT;

        const weaponSlot: TIndex = getObjectActiveWeaponSlot(this.object);
        const animationForWeaponSlot = this.getAnimationForSlot(weaponSlot, animationDescriptor.out);

        if (animationForWeaponSlot === null) {
          states.animationMarker = EAnimationMarker.OUT;
          this.onAnimationCallback(true);

          return $multi(null, null);
        }

        const nextAnimation = animationForWeaponSlot.get(states.sequenceId);

        if (type(nextAnimation) === "table") {
          this.processSpecialAction(nextAnimation as any);
          this.onAnimationCallback(false);

          return $multi(null, null);
        }

        return $multi(nextAnimation as unknown as TName, animationDescriptor);
      }

      if (states.currentState === null) {
        const state = this.animations.get(states.targetState!);

        if (state.into === null) {
          states.animationMarker = EAnimationMarker.IN;
          this.onAnimationCallback(true);

          return $multi(null, null);
        }

        states.animationMarker = EAnimationMarker.IN;

        const weaponSlot: TIndex = getObjectActiveWeaponSlot(this.object);
        const animationForWeaponSlot = this.getAnimationForSlot(weaponSlot, state.into);

        if (animationForWeaponSlot === null) {
          states.animationMarker = EAnimationMarker.IN;
          this.onAnimationCallback(true);

          return $multi(null, null);
        }

        const nextAnimation = animationForWeaponSlot.get(states.sequenceId);

        if (type(nextAnimation) === "table") {
          this.processSpecialAction(nextAnimation as any);
          this.onAnimationCallback(false);

          return $multi(null, null);
        }

        return $multi(nextAnimation as unknown as TName, state);
      }
    }

    // Same non-null animation:
    if (states.targetState === states.currentState && states.currentState !== null) {
      const activeWeaponSlot: TIndex = getObjectActiveWeaponSlot(this.object);
      const state: IAnimationDescriptor = this.animations.get(states.currentState);
      let animation;

      if (state.rnd !== null) {
        animation = this.selectRandom(
          state as IAnimationDescriptor,
          activeWeaponSlot,
          time_global() >= states.nextRandomAt!
        );
      }

      if (animation === null && state.idle !== null) {
        animation = this.getAnimationForSlot(activeWeaponSlot, state.idle as any);
      }

      if (animation !== null) {
        states.animationMarker = EAnimationMarker.IDLE;
      }

      return $multi(animation as TName, state);
    }

    return $multi(null, null);
  }

  /**
   * todo;
   */
  public selectRandom(
    animationStateDescriptor: IAnimationDescriptor,
    weaponSlot: TIndex,
    mustPlay: boolean
  ): Optional<TAnimationSequenceElements> {
    if (!mustPlay && math.random(100) > (this.animations.get(this.state.currentState!).prop.rnd as TRate)) {
      return null;
    }

    const animation: Optional<LuaArray<TAnimationSequenceElements>> = this.getAnimationForSlot(
      weaponSlot,
      animationStateDescriptor.rnd as LuaArray<TAnimationSequenceElements>
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
   * todo;
   */
  public processSpecialAction(actionTable: LuaTable): void {
    // Attach.
    if (actionTable.get("a") !== null) {
      const objectInventoryItem: Optional<ClientObject> = this.object.object(actionTable.get("a"));

      if (objectInventoryItem !== null) {
        objectInventoryItem.enable_attachable_item(true);
      }
    }

    // Detach.
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
   * todo;
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
            intoList = this.getAnimationForSlot(getObjectActiveWeaponSlot(this.object), targetAnimations.into);
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

        const properties = this.animations.get(states.currentState!).prop;

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
            outAnimationList = this.getAnimationForSlot(
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

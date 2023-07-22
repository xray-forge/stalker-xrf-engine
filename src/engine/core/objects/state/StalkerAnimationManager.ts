import { callback, hit, time_global } from "xray16";

import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { animations } from "@/engine/core/objects/animation/animations";
import { animstates } from "@/engine/core/objects/animation/animstates";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import {
  EAnimationMarker,
  EAnimationType,
  EStalkerState,
  IAnimationDescriptor,
  IAnimationManagerStates,
  IAnimationStateDescriptor,
} from "@/engine/core/objects/state/state_types";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { createVector, vectorRotateY } from "@/engine/core/utils/vector";
import { AnyCallable, ClientObject, Hit, Optional, TIndex, TName, TRate, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager of stalker object animations.
 * Handles transitions / active state / animation switching.
 * Ties engine animation callbacks and game logic.
 */
export class StalkerAnimationManager {
  public type: EAnimationType;
  public object: ClientObject;
  public stateManager: StalkerStateManager;

  public animations: LuaTable<TName, IAnimationDescriptor> | LuaTable<TName, IAnimationStateDescriptor>;
  public states: IAnimationManagerStates;

  public constructor(object: ClientObject, stateManager: StalkerStateManager, type: EAnimationType) {
    this.type = type;
    this.object = object;
    this.stateManager = stateManager;
    this.animations = type === EAnimationType.ANIMATION ? animations : animstates;

    this.states = {
      lastIndex: null,
      currentState: null,
      targetState: null,
      animationMarker: null,
      nextRandomAt: null,
      sequenceId: 1,
    };
  }

  /**
   * Allow animation control based on animation manager.
   */
  public setControl(): void {
    this.object.set_callback(callback.script_animation, this.onAnimationCallback, this);

    if (this.type === EAnimationType.ANIMATION) {
      this.stateManager.animstate.states.animationMarker = null;
    }

    if (this.states.animationMarker === null) {
      this.updateAnimation();
    }
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
  public setState(newState: Optional<EStalkerState>, isForced: Optional<boolean> = false): void {
    const now: TTimestamp = time_global();

    /**
     * Force animation over existing ones.
     */
    if (isForced === true) {
      this.object.clear_animations();

      const state =
        this.states.animationMarker === EAnimationMarker.IN
          ? this.animations.get(this.states.targetState!)
          : this.animations.get(this.states.currentState!);

      if (state !== null && state.out !== null) {
        const weaponSlot: TIndex = this.getActiveWeaponSlot();
        const animationForWeaponSlot = this.getAnimationForSlot(weaponSlot, state.out as any);

        if (animationForWeaponSlot !== null) {
          for (const [id, nextAnimation] of animationForWeaponSlot) {
            if (type(nextAnimation) === "table") {
              this.processSpecialAction(nextAnimation as any);
            }
          }
        }
      }

      this.states.animationMarker = null;

      this.states.currentState = newState;
      this.states.targetState = newState;
      this.states.sequenceId = 1;

      this.states.nextRandomAt = now;

      return;
    }

    this.states.targetState = newState;
    this.states.nextRandomAt = now;
  }

  /**
   * todo;
   */
  public selectAnimation(): LuaMultiReturn<[Optional<string>, any]> {
    const states: IAnimationManagerStates = this.states;

    // New animation detected:
    if (states.targetState !== states.currentState) {
      if (states.targetState === null) {
        const state = this.animations.get(states.currentState!);

        if (state.out === null) {
          states.animationMarker = EAnimationMarker.OUT;
          this.onAnimationCallback(true);

          return $multi(null, null);
        }

        states.animationMarker = EAnimationMarker.OUT;

        const weaponSlot: TIndex = this.getActiveWeaponSlot();
        const animationForWeaponSlot = this.getAnimationForSlot(weaponSlot, state.out as any);

        if (animationForWeaponSlot === null) {
          states.animationMarker = EAnimationMarker.OUT;
          this.onAnimationCallback(true);

          return $multi(null, null);
        }

        const nextAnimation = animationForWeaponSlot.get(states.sequenceId);

        if (type(nextAnimation) === "table") {
          this.processSpecialAction(nextAnimation as any);
          this.onAnimationCallback();

          return $multi(null, null);
        }

        return $multi(nextAnimation as any as string, state);
      }

      if (states.currentState === null) {
        const state = this.animations.get(states.targetState!);

        if (state.into === null) {
          states.animationMarker = EAnimationMarker.IN;
          this.onAnimationCallback(true);

          return $multi(null, null);
        }

        states.animationMarker = EAnimationMarker.IN;

        const weaponSlot: TIndex = this.getActiveWeaponSlot();
        const animationForWeaponSlot = this.getAnimationForSlot(weaponSlot, state.into as any);

        if (animationForWeaponSlot === null) {
          states.animationMarker = EAnimationMarker.IN;
          this.onAnimationCallback(true);

          return $multi(null, null);
        }

        const nextAnimation = animationForWeaponSlot.get(states.sequenceId);

        if (type(nextAnimation) === "table") {
          this.processSpecialAction(nextAnimation as any);
          this.onAnimationCallback();

          return $multi(null, null);
        }

        return $multi(nextAnimation as any as string, state);
      }
    }

    // Same non-null animation:
    if (states.targetState === states.currentState && states.currentState !== null) {
      const activeWeaponSlot: TIndex = this.getActiveWeaponSlot();
      const state: IAnimationDescriptor | IAnimationStateDescriptor = this.animations.get(states.currentState);
      let animation;

      if (state.rnd !== null) {
        animation = this.selectRandom(
          state as IAnimationStateDescriptor,
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

      return $multi(animation, state) as any;
    }

    return $multi(null, null);
  }

  /**
   * todo;
   */
  public getActiveWeaponSlot(): TIndex {
    const weapon: Optional<ClientObject> = this.object.active_item();

    if (weapon === null || this.object.weapon_strapped()) {
      return 0;
    }

    return weapon.animation_slot();
  }

  /**
   * todo;
   */
  public getAnimationForSlot(
    slot: TIndex,
    animationsList: LuaTable<TIndex, LuaTable<number, string | LuaTable>>
  ): LuaTable<number, string | LuaTable> {
    if (animationsList.get(slot) === null) {
      slot = 0;
    }

    return animationsList.get(slot);
  }

  /**
   * todo;
   */
  public selectRandom(
    animationStateDescriptor: IAnimationStateDescriptor,
    weaponSlot: TIndex,
    mustPlay: boolean
  ): Optional<string | LuaTable> {
    if (!mustPlay && math.random(100) > this.animations.get(this.states.currentState!).prop.rnd) {
      return null;
    }

    const animation = this.getAnimationForSlot(weaponSlot, animationStateDescriptor.rnd as any);

    if (animation === null) {
      return null;
    }

    const states: IAnimationManagerStates = this.states;
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

      this.states.lastIndex = index;
    } else {
      index = 1;
    }

    return animation.get(index) as any as string;
  }

  /**
   * todo;
   */
  public addAnimation(animation: TName, state: IAnimationDescriptor): void {
    const object: ClientObject = this.object;
    const animationProperties = state.prop;

    if (!(object.weapon_unstrapped() || object.weapon_strapped())) {
      abort("[%s] Illegal call of add animation. Weapon is strapping now.", object.name());
    }

    if (animationProperties === null || animationProperties.moving !== true) {
      object.add_animation(animation, true, false);

      return;
    }

    if (this.stateManager.animationPosition === null || this.stateManager.isPositionDirectionApplied === true) {
      object.add_animation(animation, true, true);
    } else {
      if (this.stateManager.animationDirection === null) {
        abort("[%s] Animation direction is missing.", object.name());
      }

      const rotationY: TRate = -math.deg(
        math.atan2(this.stateManager.animationDirection.x, this.stateManager.animationDirection.z)
      );

      object.add_animation(animation, true, this.stateManager.animationPosition, createVector(0, rotationY, 0), false);

      this.stateManager.isPositionDirectionApplied = true;
    }
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
    if (this.states.animationMarker === null || this.object.animation_count() !== 0) {
      return;
    }

    const states: IAnimationManagerStates = this.states;

    if (states.animationMarker === EAnimationMarker.IN) {
      states.animationMarker = null;

      if (skipMultiAnimationCheck !== true) {
        let intoList: LuaTable<number, string | LuaTable> = new LuaTable();
        const targetAnimations = this.animations.get(states.targetState!);

        if (targetAnimations !== null && targetAnimations.into !== null) {
          intoList = this.getAnimationForSlot(this.getActiveWeaponSlot(), targetAnimations.into as any);
        }

        if (intoList !== null && intoList.length() > states.sequenceId) {
          states.sequenceId = states.sequenceId + 1;
          this.updateAnimation();

          return;
        }
      }

      states.sequenceId = 1;
      states.currentState = states.targetState;
      this.updateAnimation();

      return;
    }

    if (states.animationMarker === EAnimationMarker.IDLE) {
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

    if (states.animationMarker === EAnimationMarker.OUT) {
      states.animationMarker = null;

      if (skipMultiAnimationCheck !== true) {
        let outAnimationList: LuaTable<number, string | LuaTable> = new LuaTable();

        if (this.animations.get(states.currentState!).out) {
          outAnimationList = this.getAnimationForSlot(
            this.getActiveWeaponSlot(),
            this.animations.get(states.currentState!).out as any
          ) as any;
        }

        if (outAnimationList !== null && outAnimationList.length() > states.sequenceId) {
          states.sequenceId = states.sequenceId + 1;
          this.updateAnimation();

          return;
        }
      }

      states.sequenceId = 1;
      states.currentState = null;

      if (this.type === EAnimationType.ANIMATION) {
        if (this.stateManager.animstate !== null && this.stateManager.animstate.setControl !== null) {
          this.stateManager.animstate.setControl();
          // --this.mgr.animstate:update_anim()
        }
      }
    }
  }
}

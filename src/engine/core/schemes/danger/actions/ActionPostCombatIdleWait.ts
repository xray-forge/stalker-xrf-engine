import { action_base, anim, look, LuabindClass, move, object, XR_game_object } from "xray16";

import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { StalkerAnimationManager } from "@/engine/core/objects/state/StalkerAnimationManager";
import { animations } from "@/engine/core/objects/state_lib/state_mgr_animation_list";
import { ISchemePostCombatIdleState } from "@/engine/core/schemes/danger/ISchemePostCombatIdleState";
import { Optional } from "@/engine/lib/types";

/**
 * todo;
 */
@LuabindClass()
export class ActionPostCombatIdleWait extends action_base {
  public readonly state: ISchemePostCombatIdleState;

  public animationState!: { animstate: { states: { anim_marker: null } } };
  public isAnimationStarted: boolean = false;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemePostCombatIdleState) {
    super(null, ActionPostCombatIdleWait.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_item(object.idle, this.object.best_weapon());
    this.object.set_mental_state(anim.danger);
    this.object.set_body_state(move.crouch);
    this.object.set_movement_type(move.stand);
    this.object.set_sight(look.danger, null, 0);

    this.animationState = { animstate: { states: { anim_marker: null } } };

    this.state.animation = new StalkerAnimationManager(
      this.object,
      this.animationState as any,
      "state_mgr_animation_list",
      animations
    );

    this.isAnimationStarted = false;
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    if (!this.object.in_smart_cover()) {
      if (this.isAnimationStarted === false && !isWeaponLocked(this.object)) {
        this.isAnimationStarted = true;
        this.state.animation.set_state("hide");
        this.state.animation.set_control();
      }
    }

    GlobalSoundManager.getInstance().playSound(this.object.id(), "post_combat_wait", null, null);
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    GlobalSoundManager.getInstance().playSound(this.object.id(), "post_combat_relax", null, null);

    if (this.isAnimationStarted) {
      this.state.animation.set_state(null, true);
    }

    this.state.animation = null;
    super.finalize();
  }
}

/**
 * todo;
 */
export function isWeaponLocked(object: XR_game_object): boolean {
  const isWeaponStrapped: boolean = object.weapon_strapped();
  const isWeaponUnstrapped: boolean = object.weapon_unstrapped();

  if (!(isWeaponUnstrapped || isWeaponStrapped)) {
    return true;
  }

  const bestWeapon: Optional<XR_game_object> = object.best_weapon();

  if (bestWeapon === null) {
    return false;
  }

  if (object.active_item() === null) {
    return false;
  }

  const isWeaponGoingToBeStrapped: boolean = object.is_weapon_going_to_be_strapped(bestWeapon);

  if (isWeaponGoingToBeStrapped && !isWeaponStrapped) {
    return true;
  }

  if (!isWeaponGoingToBeStrapped && !isWeaponUnstrapped) {
    return true;
  }

  return false;
}

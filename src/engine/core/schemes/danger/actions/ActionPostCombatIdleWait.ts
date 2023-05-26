import { action_base, anim, game_object, look, LuabindClass, move, object } from "xray16";

import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { EStalkerState } from "@/engine/core/objects/state";
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
        (this.state.animation as StalkerAnimationManager).setState(EStalkerState.HIDE);
        (this.state.animation as StalkerAnimationManager).setControl();
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
      (this.state.animation as StalkerAnimationManager).setState(null, true);
    }

    this.state.animation = null;
    super.finalize();
  }
}

/**
 * todo;
 */
export function isWeaponLocked(object: game_object): boolean {
  const isWeaponStrapped: boolean = object.weapon_strapped();
  const isWeaponUnstrapped: boolean = object.weapon_unstrapped();

  if (!(isWeaponUnstrapped || isWeaponStrapped)) {
    return true;
  }

  const bestWeapon: Optional<game_object> = object.best_weapon();

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

import { action_base, anim, look, LuabindClass, move, object, XR_game_object } from "xray16";

import { Optional } from "@/engine/lib/types";
import { GlobalSoundManager } from "@/engine/scripts/core/managers/GlobalSoundManager";
import { AnimationManager } from "@/engine/scripts/core/objects/state/AnimationManager";
import { animations } from "@/engine/scripts/core/objects/state/lib/state_mgr_animation_list";
import { ISchemePostCombatIdleState } from "@/engine/scripts/core/schemes/danger/ISchemePostCombatIdleState";

/**
 * todo;
 */
@LuabindClass()
export class ActionPostCombatIdleWait extends action_base {
  public readonly state: ISchemePostCombatIdleState;

  public anim_st!: { animstate: { states: { anim_marker: null } } };
  public anim_started: boolean = false;

  /**
   * todo;
   */
  public constructor(state: ISchemePostCombatIdleState) {
    super(null, ActionPostCombatIdleWait.__name);
    this.state = state;
  }

  /**
   * todo;
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_item(object.idle, this.object.best_weapon());
    this.object.set_mental_state(anim.danger);
    this.object.set_body_state(move.crouch);
    this.object.set_movement_type(move.stand);
    this.object.set_sight(look.danger, null, 0);

    this.anim_st = { animstate: { states: { anim_marker: null } } };

    this.state.animation = new AnimationManager(
      this.object,
      this.anim_st as any,
      "state_mgr_animation_list",
      animations
    );

    this.anim_started = false;
  }

  /**
   * todo;
   */
  public override execute(): void {
    super.execute();

    if (!this.object.in_smart_cover()) {
      if (this.anim_started === false && !weapon_locked(this.object)) {
        this.anim_started = true;
        this.state.animation.set_state("hide");
        this.state.animation.set_control();
      }
    }

    GlobalSoundManager.getInstance().setSoundPlaying(this.object.id(), "post_combat_wait", null, null);
  }

  /**
   * todo;
   */
  public override finalize(): void {
    GlobalSoundManager.getInstance().setSoundPlaying(this.object.id(), "post_combat_relax", null, null);

    if (this.anim_started === true) {
      this.state.animation.set_state(null, true);
    }

    this.state.animation = null;
    super.finalize();
  }
}

/**
 * todo;
 */
export function weapon_locked(object: XR_game_object): boolean {
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

  // todo: From script extension classes
  const isWeaponGoingToBeStrapped: boolean = (object as any).is_weapon_going_to_be_strapped(bestWeapon);

  if (isWeaponGoingToBeStrapped && !isWeaponStrapped) {
    return true;
  }

  if (!isWeaponGoingToBeStrapped && !isWeaponUnstrapped) {
    return true;
  }

  return false;
}

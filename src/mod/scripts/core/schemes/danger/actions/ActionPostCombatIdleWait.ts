import { action_base, anim, look, move, object, XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { GlobalSound } from "@/mod/scripts/core/GlobalSound";
import { IPostCombatSharedState } from "@/mod/scripts/core/schemes/danger/PostCombatIdle";
import { AnimationManager } from "@/mod/scripts/core/state_management/AnimationManager";
import { animations } from "@/mod/scripts/core/state_management/lib/state_mgr_animation_list";

/**
 * todo;
 */
@LuabindClass()
export class ActionPostCombatIdleWait extends action_base {
  public readonly state: IPostCombatSharedState;

  public anim_st!: { animstate: { states: { anim_marker: null } } };
  public anim_started: boolean = false;

  public constructor(state: IPostCombatSharedState) {
    super(null, ActionPostCombatIdleWait.__name);
    this.state = state;
  }

  public initialize(): void {
    super.initialize();

    this.object.set_item(object.idle, this.object.best_weapon());
    this.object.set_mental_state(anim.danger);
    this.object.set_body_state(move.crouch);
    this.object.set_movement_type(move.stand);
    this.object.set_sight(look.danger, null, 0);

    this.anim_st = { animstate: { states: { anim_marker: null } } };

    this.state.animation = create_xr_class_instance(
      AnimationManager,
      this.object,
      this.anim_st,
      "state_mgr_animation_list",
      animations
    );

    this.anim_started = false;
  }

  public execute(): void {
    super.execute();

    if (!this.object.in_smart_cover()) {
      if (this.anim_started === false && !weapon_locked(this.object)) {
        this.anim_started = true;
        this.state.animation.set_state("hide");
        this.state.animation.set_control();
      }
    }

    GlobalSound.set_sound_play(this.object.id(), "post_combat_wait", null, null);
  }

  public finalize(): void {
    GlobalSound.set_sound_play(this.object.id(), "post_combat_relax", null, null);

    if (this.anim_started === true) {
      this.state.animation.set_state(null, true);
    }

    this.state.animation = null;
    super.finalize();
  }
}

export function weapon_locked(npc: XR_game_object): boolean {
  const weapon_strapped = npc.weapon_strapped();
  const weapon_unstrapped = npc.weapon_unstrapped();

  if (!(weapon_unstrapped || weapon_strapped)) {
    return true;
  }

  const bestweapon: Optional<XR_game_object> = npc.best_weapon();

  if (bestweapon === null) {
    return false;
  }

  if (npc.active_item() === null) {
    return false;
  }

  // todo: From script extension classes
  const weapon_going_to_be_strapped: boolean = (npc as any).is_weapon_going_to_be_strapped(bestweapon);

  if (weapon_going_to_be_strapped && !weapon_strapped) {
    return true;
  }

  if (!weapon_going_to_be_strapped && !weapon_unstrapped) {
    return true;
  }

  return false;
}

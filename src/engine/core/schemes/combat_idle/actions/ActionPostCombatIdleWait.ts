import { action_base, anim, look, LuabindClass, move, object } from "xray16";

import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { EAnimationType, EStalkerState } from "@/engine/core/objects/animation";
import { StalkerAnimationManager } from "@/engine/core/objects/state/StalkerAnimationManager";
import { ISchemePostCombatIdleState } from "@/engine/core/schemes/combat_idle/ISchemePostCombatIdleState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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

  public override initialize(): void {
    logger.info("Start post combat idle state:", this.object.name());

    super.initialize();

    this.object.set_item(object.idle, this.object.best_weapon());
    this.object.set_mental_state(anim.danger);
    this.object.set_body_state(move.crouch);
    this.object.set_movement_type(move.stand);
    this.object.set_sight(look.danger, null, 0);

    this.animationState = { animstate: { states: { anim_marker: null } } };

    this.state.animation = new StalkerAnimationManager(
      this.object,
      this.animationState as any, // todo: Correct.
      EAnimationType.ANIMATION
    );

    this.isAnimationStarted = false;
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    logger.info("End post combat idle state:", this.object.name());

    GlobalSoundManager.getInstance().playSound(this.object.id(), "post_combat_relax", null, null);

    if (this.isAnimationStarted) {
      (this.state.animation as StalkerAnimationManager).setState(null, true);
    }

    this.state.animation = null;
    super.finalize();
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    if (!this.object.in_smart_cover()) {
      if (this.isAnimationStarted === false && !this.isWeaponLocked(this.object)) {
        this.isAnimationStarted = true;
        (this.state.animation as StalkerAnimationManager).setState(EStalkerState.HIDE);
        (this.state.animation as StalkerAnimationManager).setControl();
      }
    }

    GlobalSoundManager.getInstance().playSound(this.object.id(), "post_combat_wait", null, null);
  }

  /**
   * todo;
   */
  public isWeaponLocked(object: ClientObject): boolean {
    const isWeaponStrapped: boolean = object.weapon_strapped();
    const isWeaponUnstrapped: boolean = object.weapon_unstrapped();

    if (!(isWeaponUnstrapped || isWeaponStrapped)) {
      return true;
    }

    const bestWeapon: Optional<ClientObject> = object.best_weapon();

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
}

import { action_base, anim, look, LuabindClass, move } from "xray16";

import { StalkerAnimationManager } from "@/engine/core/ai/state/StalkerAnimationManager";
import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EAnimationType, EStalkerState } from "@/engine/core/animation/types";
import { getManager } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import {
  IPartialAnimationManager,
  ISchemePostCombatIdleState,
} from "@/engine/core/schemes/stalker/combat_idle/combat_idle_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectWeaponLocked, setObjectBestWeapon } from "@/engine/core/utils/weapon";
import { GameObject } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to wait some time for possible remaining enemies after combat.
 * Stalkers wait for some time and then go with alife activity / looting corpses / helping others.
 */
@LuabindClass()
export class ActionPostCombatIdleWait extends action_base {
  public readonly state: ISchemePostCombatIdleState;

  public isAnimationStarted: boolean = false;
  public stateManager!: IPartialAnimationManager;

  public constructor(state: ISchemePostCombatIdleState) {
    super(null, ActionPostCombatIdleWait.__name);
    this.state = state;
  }

  public override initialize(): void {
    super.initialize();

    const object: GameObject = this.object;

    logger.info("Start post combat idle state: %s", object.name());

    setObjectBestWeapon(object);

    object.set_mental_state(anim.danger);
    object.set_body_state(move.crouch);
    object.set_movement_type(move.stand);
    object.set_sight(look.danger, null, 0);

    this.isAnimationStarted = false;
    this.stateManager = { animstate: { state: { animationMarker: null } } };

    this.state.animation = new StalkerAnimationManager(
      object,
      this.stateManager as unknown as StalkerStateManager,
      EAnimationType.ANIMATION
    );
  }

  public override finalize(): void {
    logger.info("End post combat idle state: %s", this.object.name());

    getManager(SoundManager).play(this.object.id(), "post_combat_relax");

    if (this.isAnimationStarted) {
      (this.state.animation as StalkerAnimationManager).setState(null, true);
    }

    this.state.animation = null;
    super.finalize();
  }

  public override execute(): void {
    super.execute();

    if (this.isAnimationStarted) {
      return;
    }

    if (this.object.in_smart_cover()) {
      return;
    }

    if (isObjectWeaponLocked(this.object)) {
      return;
    }

    this.isAnimationStarted = true;

    (this.state.animation as StalkerAnimationManager).setState(EStalkerState.HIDE);
    (this.state.animation as StalkerAnimationManager).setControl();

    getManager(SoundManager).play(this.object.id(), "post_combat_wait");
  }
}

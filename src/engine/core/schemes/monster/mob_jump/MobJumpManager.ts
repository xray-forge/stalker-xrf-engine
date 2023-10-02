import { cond, look, patrol } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { EMobJumpState, ISchemeMobJumpState } from "@/engine/core/schemes/monster/mob_jump/mob_jump_types";
import { abort } from "@/engine/core/utils/assertion";
import { scriptCaptureMonster, scriptCommandMonster, scriptReleaseMonster } from "@/engine/core/utils/scheme";
import { addVectors } from "@/engine/core/utils/vector";
import { Optional, Patrol, Vector } from "@/engine/lib/types";

/**
 * Manager of jump logics.
 * Forces monster to patrol some point and jump to scare player.
 * After jumping, monster is free from any logics and just behave usually.
 */
export class MobJumpManager extends AbstractSchemeManager<ISchemeMobJumpState> {
  public jumpPath: Optional<Patrol> = null;
  public point: Optional<Vector> = null;
  public jumpState: Optional<EMobJumpState> = null;

  public override activate(): void {
    scriptCaptureMonster(this.object, true, MobJumpManager.name);

    this.state.signals = new LuaTable();
    this.jumpPath = null;

    if (this.state.jumpPathName) {
      this.jumpPath = new patrol(this.state.jumpPathName);
    } else {
      this.state.jumpPathName = "[not-defined]";
    }

    if (!this.jumpPath) {
      abort("Object '%s' unable to find jumpPath '%s' on the map.", this.object.name(), this.state.jumpPathName);
    }

    this.jumpState = EMobJumpState.START_LOOK;
    this.point = addVectors(this.jumpPath.point(0), this.state.offset);
  }

  public update(): void {
    if (this.jumpState === EMobJumpState.START_LOOK) {
      if (!this.object.action()) {
        scriptCommandMonster(this.object, new look(look.point, this.point!), new cond(cond.look_end));

        this.jumpState = EMobJumpState.WAIT_LOOK_END;
      }
    } else if (this.jumpState === EMobJumpState.WAIT_LOOK_END) {
      if (!this.object.action()) {
        this.jumpState = EMobJumpState.JUMP;
      }
    }

    if (this.jumpState === EMobJumpState.JUMP) {
      this.object.jump(this.point!, this.state.phJumpFactor);
      this.state.signals!.set("jumped", true);
      scriptReleaseMonster(this.object);
    }
  }
}
